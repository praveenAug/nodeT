const express = require('express');
const MOCKDATA = require('./MOCK_DATA.json');
const fs = require('fs').promises;

const app = express();

app.use(express.urlencoded({ extended: true }));

async function readUsers() {
  try {
    const data = await fs.readFile(MOCKDATA, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
}

async function writeUsers(users) {
  try {
    const json = JSON.stringify(users, null, 2);
    await fs.writeFile(MOCKDATA, json); 
  } catch (err) {
    console.error('Error writing users:', err);
  }
}


app.get('/users', (req, res) => {
    const html = `
  <html>
    <ul>
    ${MOCKDATA.map((user) => {
        return (
            `<li>${user.first_name}</li>`
        )
    }).join("")}
    </ul>
  </html>
  `
    return res.send(html);
})

// middleware

app.use((req, res, next) => {
    // res.send({status: 'error'})
    next();
})

app.get('/api/users', (req, res) => {
    res.setHeader('myName', "prav")
    return res.json(MOCKDATA)
})

app.post('/api/users', (req, res) => {
    const body = req.body;
    MOCKDATA.push({ ...body, id: MOCKDATA.length + 1 });
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(MOCKDATA), (err, result) => {
        return res.json({ status: 'success', id: MOCKDATA.length });
    })
})

app
    .route('/api/users/:id')
    .get((req, res) => {
        const user_id = Number(req.params.id);
        const userData = MOCKDATA.find((user) => user.id === user_id);
        return res.json(userData);
    }).patch((req, res) => {
        const user_id = Number(req.params.id);
        const userData = MOCKDATA.find((user) => user.id === user_id);

        let users = readUsers();
        const patch_req = req.body;
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        Object.assign(userData, patch_req);
       
        writeUsers(users);

        res.json({ message: 'User updated', user: userData });

    }).delete((req, res) => {
        return res.json({ status: 'pending status' });
    })

app.listen(8000, () => console.log('server started'));