module.exports = ({ config }) => {
    return {
      ...config,  // Spread the existing config
      extra: {
        ...config.extra,
        eas: {
          projectId: '5df29d58-2ff7-48d3-b0b8-92f6d81ca820',
        },
      },
    };
  };