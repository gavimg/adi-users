
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/UsersApp';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/UsersApp' ? typeof import('REMOTE_ALIAS_IDENTIFIER/UsersApp') :any;