const express = require('express');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;

app.use(express.static('public'));

io.on('connection', socket => {
  console.log('Novo cliente conectado');

  socket.on('executar-comando', acao => {
    if (acao === 'start') {
      executarComando(socket, 'cd .. && cd proxmox_kidboo_config && ls -la && ansible-playbook -i hosts playbook_cdk_up.yml -u root -vvv');
    } else if (acao === 'stop') {
      executarComando(socket, 'cd .. && cd proxmox_kidboo_config && ls -la && ansible-playbook -i hosts playbook_cdk_down.yml -u root -vvv');
    }
  });
});

function executarComando(socket, comando) {
  const childProcess = exec(comando);
  
  childProcess.stdout.on('data', data => {
    console.log(`Resultado do comando: ${data}`);
    socket.emit('log', data);
  });

  childProcess.stderr.on('data', data => {
    console.error(`Erro ao executar o comando: ${data}`);
    socket.emit('log', data);
  });

  childProcess.on('close', code => {
    console.log('Comando encerrado com código:', code);
    socket.emit('log', `Comando encerrado com código: ${code}`);
  });
}

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});