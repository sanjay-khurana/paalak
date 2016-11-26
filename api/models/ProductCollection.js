/**
 * Products.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

attributes: {
  "idProduct": {'type': 'int'},
  "name": { type: 'string' },
  "fkCategoryId": {'type': 'int'},
  "price": {'type': 'int'},
  "specialPrice": {'type': 'int'},
  "unit": {type : "json"},
  "imagePath": { type: 'string' },
  "createdAt": { type: 'string' },
  "updatedAt": { type: 'string' }
}	
 
};

