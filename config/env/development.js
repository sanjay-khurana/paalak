/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

   models: {
     connection: 'someMongodbServer'
   },
   deliverablePincodes: [
   		'110059', '110001'
   ],
   staticsRegex: /\.(eot|ttf|woff|gif|jpeg|jpg|png|woff2|woff|js|css|ico|mp4|webp)$/g,

   otpApiConfig : {
      url : 'http://login.goinfinito.com/api/v1/subscribers?auth_token=29dab9d20ba7bd6cd08b7a6d767628a7',
      listId : 272,
      userId : 'paalakinf'
   },

   orderSmsConfig : {
      url : ' http://login.goinfinito.com/api/v1/subscribers?auth_token=29dab9d20ba7bd6cd08b7a6d767628a7',
      listId : 273,
      userId : 'paalakinf'
   }

};
