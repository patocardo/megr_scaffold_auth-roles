const Role = require('../../models/role');
const ErrorMessages = require('../../helpers/error-messages');

const roleResolvers = {
  roles: () => Role.find(),
  roleById: (args) => Role.findById(args.id),
  createRole: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      if(!req.userData.roles.some((role) => role.name === 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const existingRole = await Role.find({ name: args.roleInput.name });
      if(existingRole.length > 0) throw new Error(ErrorMessages.duplicate('Role').response);

      const role = new Role({...args.roleInput});
      const createdRole = await role.save();
      return createdRole;
    } catch(err) {
      throw err;
    }
  },
  updateRole: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      if(!req.userData.roles.some((role) => role.name === 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const existingRole = await Role.findById(args.roleInput.id);
      if(existingRole.length === 0) throw new Error(ErrorMessages.nonexistent('Role').response);
      if(args.roleInput.name != existingRole.name) {
        const otherRole = Role.find({name: args.roleInput.name});
        if (otherRole != existingRole) throw new Error(ErrorMessages.duplicate('Role').response);
      }
      const modifiedRole = await Role.findByIdAndUpdate(args, req.userData);
      return modifiedRole;
    } catch (e) {
      throw err;
    }
  },
  removeRole: async (args, req) => {
    try {
      if(!req.isAuth) throw new Error(ErrorMessages.notAuthenticated.response);
      if(!req.userData.roles.some((role) => role.name === 'sudo')) throw new Error(ErrorMessages.notAuthorized.response);
      const existingRole = await Role.findById(args.roleInput.id);
      if(!existingRole) throw new Error(ErrorMessages.nonexistent('Role').response);
      const removedRole = await Role.findByIdAndRemove(args);
      return removedRole;
    } catch (e) {
      throw err;
    }
  }
};

module.exports = roleResolvers;
