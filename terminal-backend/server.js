   // server.js
   const express = require('express');
   const cors = require('cors');
   const bodyParser = require('body-parser');
   const { exec } = require('child_process');

   const app = express();
   const PORT = 5000;

   app.use(cors());
   app.use(bodyParser.json());

   app.post('/execute', (req, res) => {
     const command = req.body.command;

     exec(command, (error, stdout, stderr) => {
       if (error) {
         return res.status(500).json({ error: stderr });
       }
       res.json({ output: stdout });
     });
   });

   app.listen(PORT, () => {
     console.log(`Server is running on http://localhost:${PORT}`);
   });