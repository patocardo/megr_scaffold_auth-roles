module.exports = {
  notAuthenticated: {
    response: JSON.stringify({
      name: 'not-authenticated',
      public: 'Session ended'
    })
  },
  notAuthorized: {
    response: JSON.stringify({
      name: 'not-authorized',
      public: 'You are not allowed to execute this operation'
    }),
    log: 'attempt to execute not authorized resolver'
  },
  inconsistency: (inWhat) => {
    return {
      response: JSON.stringify({
        name: 'inconsistency',
        public: 'There was a problem in the data of ' + inWhat
      }),
      log: 'attempt to execute resolver with inconsistency in ' + inWhat
    }
  },
  duplicate: (model) => {
    return {
      response: JSON.stringify({
        name: 'duplicate',
        public: model + ' with this data already exists'
      }),
      log: 'attempt to duplicate ' + model
    }
  },
  nonexistent: (model) => {
    return {
      response: JSON.stringify({
        name: 'nonexistent',
        public: model + ' with this id does not exists'
      }),
      log: 'attempt to modified nonexistent ' + model
    }
  }
};
