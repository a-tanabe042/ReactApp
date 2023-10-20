const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');

const app = express();
const docker = new Docker();

app.use(cors());
app.use(express.json());

let existingContainerId = null;
let removeTimeout = null;

const IMAGE_MAPPINGS = {
  '/js-compile': {
    image: 'docker_sandbox',
    port: '8080/tcp'
  },
  '/react-compile': {
    image: 'docker_sandbox_react',
    port: '8079/tcp'
  }
};


app.post('/:compileType', async (req, res) => {
  const compileType = req.params.compileType;
  const config = IMAGE_MAPPINGS[`/${compileType}`];

  if (!config) {
    return res.status(400).json({ message: "Invalid compile type provided." });
  }

  try {
    if (existingContainerId) {
      const oldContainer = docker.getContainer(existingContainerId);
      await oldContainer.remove({ force: true });
      existingContainerId = null;
    }

    const { code } = req.body;
    const container = await createContainer(code, config.image, config.port);
    await container.start();

    const containerInfo = await container.inspect();
    const hostPort = containerInfo.NetworkSettings.Ports[config.port][0].HostPort;
    existingContainerId = container.id;

    res.json({ containerPath: hostPort, containerId: container.id });
  } catch (error) {
    console.error('Run Error:', error);
    res.status(400).json({ result: error.message });
  }

  if (removeTimeout) {
    clearTimeout(removeTimeout);
    removeTimeout = null;
  }

  removeTimeout = setTimeout(async () => {
    try {
      if (existingContainerId) {
        const containerToRemove = docker.getContainer(existingContainerId);
        await containerToRemove.remove({ force: true });
        existingContainerId = null;
        console.log('Container removed after 30 seconds');
      }
    } catch (error) {
      console.error('Error removing container:', error.message);
    }
  }, 30000);
});

app.post('/execute', async (req, res) => {
  const { containerId, code } = req.body;
  try {
    if (existingContainerId && existingContainerId !== containerId) {
      const oldContainer = docker.getContainer(existingContainerId);
      await oldContainer.remove({ force: true });
      existingContainerId = containerId;
    }

    const result = await executeInContainer(containerId, code);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function createContainer(code, imageName, containerPort) {
  const randomPort = getRandomPort(8081, 9999).toString();

  return await docker.createContainer({
    Image: imageName,
    Env: [`CODE=${code}`],
    HostConfig: {
      NetworkMode: 'react_network1',
      PortBindings: {
        [containerPort]: [{ HostPort: randomPort }]
      }
    },
    NetworkingConfig: {
      EndpointsConfig: {
        react_network1: {}
      }
    },
    ExposedPorts: {
      [containerPort]: {}
    }
  });
}

function getRandomPort(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function executeInContainer(containerId, code) {
  const container = docker.getContainer(containerId);
  const execOptions = {
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ['node', '-e', code]
  };
  const exec = await container.exec(execOptions);
  return new Promise((resolve, reject) => {
    exec.start((err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', chunk => output += chunk);
      stream.on('end', () => resolve(output));
    });
  });
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
