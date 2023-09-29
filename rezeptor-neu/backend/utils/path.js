const HOMEPATH = process.argv[1].replace( /([^\/|\\]+)$/,'');

export const homePath = () => HOMEPATH ;
export const buildPath = () => HOMEPATH + '..' + HOMEPATH.at( -1 ) + 'frontend' + HOMEPATH.at( -1 ) + 'build' + HOMEPATH.at( -1 );
