const Role = require('../../models/role');
const ErrorMessages = require('../../helpers/error-messages');

const roleResolvers = {
  roles: async function (args, req) {
    try {
      if(!this.isAuthorized('roles', req)) throw new Error(ErrorMessages.notAuthorized.response);
      return (!!args.search)
          ? Role.fuzzySearch(args.search)
          : Role.find();;
    } catch(err) {
      throw err;
    }
  },
  roleById: async function (args, req) {
    if(!this.isAuthorized('roleById', req)) throw new Error(ErrorMessages.notAuthorized.response);
    return Role.findById(args.id);
  },
  roleCreate: async function (args, req) {
    try {
      if(!this.isAuthorized('roleCreate', req, 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const existingRole = await Role.find({ name: args.roleInput.name });
      if(existingRole.length > 0) throw new Error(ErrorMessages.duplicate('Role').response);
      const role = new Role({...args.roleInput});

      const createdRole = await role.save();
      return createdRole;
    } catch(err) {
      throw err;
    }
  },
  roleUpdate: async function (args, req) {
    try {
      if(!this.isAuthorized('roleUpdate', req, 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const existingRole = await Role.findById(args.id);
      if(!existingRole) throw new Error(ErrorMessages.nonexistent('Role').response);
      if(args.roleInput.name != existingRole.name) {
        const otherRole = Role.find({name: args.roleInput.name});
        if (otherRole != existingRole) throw new Error(ErrorMessages.duplicate('Role').response);
      }
      await existingRole.updateOne({}, args.roleInput);
      return existingRole;
    } catch (err) {
      throw err;
    }
  },
  rolesRemove: async (args, req) => {
    try {
      if(!this.isAuthorized('rolesRemove', req, 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const removedRoles = await Role.deleteMany({'_id': { $in: args.ids }});
      if (removedRoles.ok !== 1) throw new Error(ErrorMessages.failed('remove roles').response);
      return removedRoles.deletedCount; 
    } catch (e) {
      throw err;
    }
  }
};

module.exports = roleResolvers;
