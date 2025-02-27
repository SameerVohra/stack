import * as yup from "yup";

const _idDescription = (identify: string) => `The immutable ID used to uniquely identify this ${identify}`;
const _displayNameDescription = (identify: string) => `Human-readable ${identify} display name, used in places like frontend UI. This is not a unique identifier.`;
const _clientMetaDataDescription = (identify: string) => `Client metadata. Used as a data store, accessible from the client side. Do not store information that should not be exposed to the client.`;
const _serverMetaDataDescription = (identify: string) => `Server metadata. Used as a data store, only accessible from the server side. You can store secret information related to the ${identify} here.`;
const _atMillisDescription = (identify: string) => `(the number of milliseconds since epoch, January 1, 1970, UTC)`;
const _createdAtMillisDescription = (identify: string) => `The time the ${identify} was created ${_atMillisDescription(identify)}`;
const _updatedAtMillisDescription = (identify: string) => `The time the ${identify} was last updated ${_atMillisDescription(identify)}`;

declare const StackAdaptSentinel: unique symbol;
export type StackAdaptSentinel = typeof StackAdaptSentinel;

// Built-in replacements
/* eslint-disable no-restricted-syntax */
export function yupString<A extends string, B extends yup.Maybe<yup.AnyObject> = yup.AnyObject>(...args: Parameters<typeof yup.string<A, B>>) {
  return yup.string(...args);
}
export function yupNumber<A extends number, B extends yup.Maybe<yup.AnyObject> = yup.AnyObject>(...args: Parameters<typeof yup.number<A, B>>) {
  return yup.number(...args);
}
export function yupBoolean<A extends boolean, B extends yup.Maybe<yup.AnyObject> = yup.AnyObject>(...args: Parameters<typeof yup.boolean<A, B>>) {
  return yup.boolean(...args);
}
/**
 * @deprecated, use number of milliseconds since epoch instead
 */
export function yupDate<A extends Date, B extends yup.Maybe<yup.AnyObject> = yup.AnyObject>(...args: Parameters<typeof yup.date<A, B>>) {
  return yup.date(...args);
}
export function yupMixed<A extends {}>(...args: Parameters<typeof yup.mixed<A>>) {
  return yup.mixed(...args);
}
export function yupArray<A extends yup.Maybe<yup.AnyObject> = yup.AnyObject, B = any>(...args: Parameters<typeof yup.array<A, B>>) {
  return yup.array(...args);
}
export function yupTuple<T extends [unknown, ...unknown[]]>(...args: Parameters<typeof yup.tuple<T>>) {
  return yup.tuple<T>(...args);
}
export function yupObject<A extends yup.Maybe<yup.AnyObject>, B extends yup.ObjectShape>(...args: Parameters<typeof yup.object<A, B>>) {
  const object = yup.object(...args).test(
    'no-unknown-object-properties',
    ({ path }) => `${path} contains unknown properties`,
    async (value: any, context) => {
      if (context.options.context?.noUnknownPathPrefixes?.some((prefix: string) => context.path.startsWith(prefix))) {
        const availableKeys = new Set(Object.keys(context.schema.fields));
        const unknownKeys = Object.keys(value ?? {}).filter(key => !availableKeys.has(key));
        if (unknownKeys.length > 0) {
          // TODO "did you mean XYZ"
          return context.createError({
            message: `${context.path} contains unknown properties: ${unknownKeys.join(', ')}`,
            path: context.path,
            params: { unknownKeys },
          });
        }
      }
      return true;
    },
  );

  // we don't want to update the type of `object` to have a default flag
  return object.default(undefined) as any as typeof object;
}
/* eslint-enable no-restricted-syntax */

// Common
export const adaptSchema = yupMixed<StackAdaptSentinel>();
/**
 * Yup's URL schema does not recognize some URLs (including `http://localhost`) as a valid URL. This schema is a workaround for that.
 */
export const urlSchema = yupString().test({
  name: 'url',
  message: 'Invalid URL',
  test: (value) => {
    if (value === undefined) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
});
export const jsonSchema = yupMixed().nullable().defined().transform((value) => JSON.parse(JSON.stringify(value)));
export const jsonStringSchema = yupString().test("json", "Invalid JSON format", (value) => {
  if (value == null) return true;
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
});
export const emailSchema = yupString().email();

// Request auth
export const clientOrHigherAuthTypeSchema = yupString().oneOf(['client', 'server', 'admin']);
export const serverOrHigherAuthTypeSchema = yupString().oneOf(['server', 'admin']);
export const adminAuthTypeSchema = yupString().oneOf(['admin']);

// Projects
export const projectIdSchema = yupString().meta({ openapiField: { description: _idDescription('project'), exampleValue: 'e0b52f4d-dece-408c-af49-d23061bb0f8d' } });
export const projectDisplayNameSchema = yupString().meta({ openapiField: { description: _displayNameDescription('project'), exampleValue: 'MyMusic' } });
export const projectDescriptionSchema = yupString().nullable().meta({ openapiField: { description: 'A human readable description of the project', exampleValue: 'A music streaming service' } });
export const projectCreatedAtMillisSchema = yupNumber().meta({ openapiField: { description: _createdAtMillisDescription('project'), exampleValue: 1630000000000 } });
export const projectUserCountSchema = yupNumber().meta({ openapiField: { description: 'The number of users in this project', exampleValue: 10 } });
export const projectIsProductionModeSchema = yupBoolean().meta({ openapiField: { description: 'Whether the project is in production mode', exampleValue: true } });
// Project config
export const projectConfigIdSchema = yupString().meta({ openapiField: { description: _idDescription('project config'), exampleValue: 'd09201f0-54f5-40bd-89ff-6d1815ddad24' } });
export const projectAllowLocalhostSchema = yupBoolean().meta({ openapiField: { description: 'Whether localhost is allowed as a domain for this project. Should only be allowed in development mode', exampleValue: true } });
export const projectCreateTeamOnSignUpSchema = yupBoolean().meta({ openapiField: { description: 'Whether a team should be created for each user that signs up', exampleValue: true } });
export const projectMagicLinkEnabledSchema = yupBoolean().meta({ openapiField: { description: 'Whether magic link authentication is enabled for this project', exampleValue: true } });
export const projectCredentialEnabledSchema = yupBoolean().meta({ openapiField: { description: 'Whether email password authentication is enabled for this project', exampleValue: true } });
// Project OAuth config
export const oauthIdSchema = yupString().oneOf(['google', 'github', 'facebook', 'microsoft', 'spotify']).meta({ openapiField: { description: 'OAuth provider ID, one of google, github, facebook, microsoft, spotify', exampleValue: 'google' } });
export const oauthEnabledSchema = yupBoolean().meta({ openapiField: { description: 'Whether the OAuth provider is enabled. If an provider is first enabled, then disabled, it will be shown in the list but with enabled=false', exampleValue: true } });
export const oauthTypeSchema = yupString().oneOf(['shared', 'standard']).meta({ openapiField: { description: 'OAuth provider type, one of shared, standard. "shared" uses Stack shared OAuth keys and it is only meant for development. "standard" uses your own OAuth keys and will show your logo and company name when signing in with the provider.', exampleValue: 'standard' } });
export const oauthClientIdSchema = yupString().meta({ openapiField: { description: 'OAuth client ID. Needs to be specified when using type="standard"', exampleValue: 'google-oauth-client-id' } });
export const oauthClientSecretSchema = yupString().meta({ openapiField: { description: 'OAuth client secret. Needs to be specified when using type="standard"', exampleValue: 'google-oauth-client-secret' } });
// Project email config
export const emailTypeSchema = yupString().oneOf(['shared', 'standard']).meta({ openapiField: { description: 'Email provider type, one of shared, standard. "shared" uses Stack shared email provider and it is only meant for development. "standard" uses your own email server and will have your email address as the sender.', exampleValue: 'standard' } });
export const emailSenderNameSchema = yupString().meta({ openapiField: { description: 'Email sender name. Needs to be specified when using type="standard"', exampleValue: 'Stack' } });
export const emailHostSchema = yupString().meta({ openapiField: { description: 'Email host. Needs to be specified when using type="standard"', exampleValue: 'smtp.your-domain.com' } });
export const emailPortSchema = yupNumber().meta({ openapiField: { description: 'Email port. Needs to be specified when using type="standard"', exampleValue: 587 } });
export const emailUsernameSchema = yupString().meta({ openapiField: { description: 'Email username. Needs to be specified when using type="standard"', exampleValue: 'smtp-email' } });
export const emailSenderEmailSchema = emailSchema.meta({ openapiField: { description: 'Email sender email. Needs to be specified when using type="standard"', exampleValue: 'example@your-domain.com' } });
export const emailPasswordSchema = yupString().meta({ openapiField: { description: 'Email password. Needs to be specified when using type="standard"', exampleValue: 'your-email-password' } });
// Project domain config
export const domainSchema = yupString().test('is-https', 'Domain must start with https://', (value) => value?.startsWith('https://')).meta({ openapiField: { description: 'Your domain URL. Make sure you own and trust this domain. Needs to start with https://', exampleValue: 'example.com' } });
export const handlerPathSchema = yupString().test('is-handler-path', 'Handler path must start with /', (value) => value?.startsWith('/')).meta({ openapiField: { description: 'Handler path. If you did not setup a custom handler path, it should be "/handler" by default. It needs to start with /', exampleValue: '/handler' } });

// Users
export class ReplaceFieldWithOwnUserId extends Error {
  constructor(public readonly path: string) {
    super(`This error should be caught by whoever validated the schema, and the field in the path '${path}' should be replaced with the current user's id. This is a workaround to yup not providing access to the context inside the transform function.`);
  }
}
const userIdMeSentinelUuid = "cad564fd-f81b-43f4-b390-98abf3fcc17e";
export const userIdOrMeSchema = yupString().uuid().transform(v => {
  if (v === "me") return userIdMeSentinelUuid;
  else return v;
}).test((v, context) => {
  if (v === userIdMeSentinelUuid) throw new ReplaceFieldWithOwnUserId(context.path);
  return true;
}).meta({ openapiField: { description: 'The ID of the user, or the special value `me` to signify the currently authenticated user', exampleValue: '3241a285-8329-4d69-8f3d-316e08cf140c' } });
export const userIdSchema = yupString().uuid().meta({ openapiField: { description: _idDescription('user'), exampleValue: '3241a285-8329-4d69-8f3d-316e08cf140c' } });
export const primaryEmailSchema = emailSchema.meta({ openapiField: { description: 'Primary email', exampleValue: 'johndoe@example.com' } });
export const primaryEmailVerifiedSchema = yupBoolean().meta({ openapiField: { description: 'Whether the primary email has been verified to belong to this user', exampleValue: true } });
export const userDisplayNameSchema = yupString().nullable().meta({ openapiField: { description: _displayNameDescription('user'), exampleValue: 'John Doe' } });
export const selectedTeamIdSchema = yupString().meta({ openapiField: { description: 'ID of the team currently selected by the user', exampleValue: 'team-id' } });
export const profileImageUrlSchema = yupString().meta({ openapiField: { description: 'Profile image URL', exampleValue: 'https://example.com/image.jpg' } });
export const signedUpAtMillisSchema = yupNumber().meta({ openapiField: { description: 'Signed up at milliseconds', exampleValue: 1630000000000 } });
export const userClientMetadataSchema = jsonSchema.meta({ openapiField: { description: _clientMetaDataDescription('user'), exampleValue: { key: 'value' } } });
export const userServerMetadataSchema = jsonSchema.meta({ openapiField: { description: _serverMetaDataDescription('user'), exampleValue: { key: 'value' } } });

// Auth
export const signInEmailSchema = emailSchema.meta({ openapiField: { description: 'The email to sign in with.', exampleValue: 'johndoe@example.com' } });
export const emailOtpSignInCallbackUrlSchema = urlSchema.meta({ openapiField: { description: 'The base callback URL to construct the magic link from. A query argument `code` with the verification code will be appended to it. The page should then make a request to the `/auth/otp/sign-in` endpoint.', exampleValue: 'https://example.com/handler/magic-link-callback' } });
export const emailVerificationCallbackUrlSchema = urlSchema.meta({ openapiField: { description: 'The base callback URL to construct a verification link for the verification e-mail. A query argument `code` with the verification code will be appended to it. The page should then make a request to the `/contact-channels/verify` endpoint.', exampleValue: 'https://example.com/handler/email-verification' } });
export const accessTokenResponseSchema = yupString().meta({ openapiField: { description: 'Short-lived access token that can be used to authenticate the user', exampleValue: 'eyJhmMiJBMTO...diI4QT' } });
export const refreshTokenResponseSchema = yupString().meta({ openapiField: { description: 'Long-lived refresh token that can be used to obtain a new access token', exampleValue: 'i8nsoaq2...14y' } });
export const signInResponseSchema = yupObject({
  refresh_token: refreshTokenResponseSchema.required(),
  access_token: accessTokenResponseSchema.required(),
  is_new_user: yupBoolean().meta({ openapiField: { description: 'Whether the user is a new user', exampleValue: true } }).required(),
  user_id: userIdSchema.required(),
});

// Permissions
export const teamSystemPermissions = [
  '$update_team',
  '$delete_team',
  '$read_members',
  '$remove_members',
  '$invite_members',
] as const;
export const teamPermissionIdSchema = yupString()
  .matches(/^\$?[a-z0-9_:]+$/, 'Only lowercase letters, numbers, ":", "_" and optional "$" at the beginning are allowed')
  .test('is-system-permission', 'System permissions must start with a dollar sign', (value, ctx) => {
    if (!value) return true;
    if (value.startsWith('$') && !teamSystemPermissions.includes(value as any)) {
      return ctx.createError({ message: 'Invalid system permission' });
    }
    return true;
  })
  .meta({ openapiField: { description: `The permission ID used to uniquely identify a permission. Can either be a custom permission with lowercase letters, numbers, ":", and "_" characters, or one of the system permissions: ${teamSystemPermissions.join(', ')}`, exampleValue: '$read_secret_info' } });
export const customTeamPermissionIdSchema = yupString()
  .matches(/^[a-z0-9_:]+$/, 'Only lowercase letters, numbers, ":", "_" are allowed')
  .meta({ openapiField: { description: 'The permission ID used to uniquely identify a permission. Can only contain lowercase letters, numbers, ":", and "_" characters', exampleValue: 'read_secret_info' } });
export const teamPermissionDescriptionSchema = yupString().meta({ openapiField: { description: 'A human-readable description of the permission', exampleValue: 'Read secret information' } });
export const containedPermissionIdsSchema = yupArray(teamPermissionIdSchema.required()).meta({ openapiField: { description: 'The IDs of the permissions that are contained in this permission', exampleValue: ['read_public_info'] } });

// Teams
export const teamIdSchema = yupString().uuid().meta({ openapiField: { description: _idDescription('team'), exampleValue: 'ad962777-8244-496a-b6a2-e0c6a449c79e' } });
export const teamDisplayNameSchema = yupString().meta({ openapiField: { description: _displayNameDescription('team'), exampleValue: 'My Team' } });
export const teamClientMetadataSchema = jsonSchema.meta({ openapiField: { description: _clientMetaDataDescription('team'), exampleValue: { key: 'value' } } });
export const teamServerMetadataSchema = jsonSchema.meta({ openapiField: { description: _serverMetaDataDescription('team'), exampleValue: { key: 'value' } } });
export const teamCreatedAtMillisSchema = yupNumber().meta({ openapiField: { description: _createdAtMillisDescription('team'), exampleValue: 1630000000000 } });

// Utils
export function yupRequiredWhen<S extends yup.AnyObject>(
  schema: S,
  triggerName: string,
  isValue: any
): S {
  return schema.when(triggerName, {
    is: isValue,
    then: (schema: S) => schema.required(),
    otherwise: (schema: S) => schema.optional()
  });
}
