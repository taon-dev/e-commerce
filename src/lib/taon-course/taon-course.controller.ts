import {
  TaonCmsContentEntity,
  TaonCmsContentRepository,
} from '@taon-dev/cms/src';
import {
  TaonSessionKvRepository,
  TaonSessionRepository,
} from '@taon-dev/session/src';
import { GET, Query, Taon, TaonBaseController, TaonController } from 'taon/src';

import {
  TaonAuthContextEntity,
  TaonAuthContextRepository,
} from '../decorators/taon-cms-authorization';

export interface TaonCourseResponse {
  post: TaonCmsContentEntity;
  privatePostMissing: boolean;
  unavailableItems: number;
}

@TaonController({ className: 'TaonCourseController' })
export class TaonCourseController extends TaonBaseController {
  private readonly posts = this.injectCustomRepo(TaonCmsContentRepository);

  private readonly sessions = this.injectCustomRepo(TaonSessionRepository);

  private readonly tokens = this.injectCustomRepo(TaonSessionKvRepository);

  private readonly authorization = this.injectCustomRepo(
    TaonAuthContextRepository,
  );

  @GET()
  getCourse(
    @Query('publicSlug') publicSlug: string,
    @Query('privateSlug') privateSlug = '',
  ): Taon.Response<TaonCourseResponse> {
    //#region @websqlFunc
    return async (req, res, { t }) => {
      if (
        typeof publicSlug !== 'string' ||
        !publicSlug.trim() ||
        typeof privateSlug !== 'string'
      ) {
        Taon.error({
          message: t.gettext('A public course post slug is required.'),
          status: 400,
        });
        return;
      }
      let context: TaonAuthContextEntity | undefined;
      if (this.tokens.getTokenFromRequest(req)) {
        await this.sessions.throwIfNotAuthenticated({ req, res });
        context = await this.authorization.getContext(
          req.userId,
          req.sessionId,
        );
      }
      const userPermissions = new Set<string>(context?.permissions ?? []);
      // CMS currently exposes post bodies/relations only to managers. Resolve
      // effective permissions here, using the same read policy as CMS media.
      const canRead = async (post: TaonCmsContentEntity): Promise<boolean> => {
        const { permissions } = await this.posts.getPermissionConfiguration(
          post.id,
          true,
        );
        return (
          (post.status === 'published' && permissions.length === 0) ||
          !!context?.isSuperUser ||
          permissions.some(permission => userPermissions.has(permission.code))
        );
      };
      const privatePost = privateSlug.trim()
        ? await this.posts.getContentBySlugForMedia(privateSlug.trim())
        : null;
      const selected =
        privatePost && (await canRead(privatePost))
          ? privatePost
          : await this.posts.getContentBySlugForMedia(publicSlug.trim());
      if (!selected || !(await canRead(selected))) {
        Taon.error({
          message: t.gettext(
            'The course post was not found or is not accessible.',
          ),
          status: 404,
        });
        return;
      }
      const related = await this.posts.listRelatedPosts(selected.id);
      const readable = await Promise.all(related.map(canRead));
      // Do not serialize nested relations (which have not been authorized).
      const cleanPost = (post: TaonCmsContentEntity): TaonCmsContentEntity =>
        Object.assign(new TaonCmsContentEntity(), post, {
          relatedPosts: [],
          permissions: [],
          applicationHook: null,
        });
      const post = cleanPost(selected);
      post.relatedPosts = related
        .filter((_, index) => readable[index])
        .map(cleanPost);
      return {
        post,
        privatePostMissing: !!privateSlug.trim() && !privatePost,
        unavailableItems: related.length - post.relatedPosts.length,
      };
    };
    //#endregion
  }
}
