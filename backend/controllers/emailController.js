const nodemailer = require("nodemailer");

exports.sendArrivalNewsEmail = async (req,res)=>{

try{

const { email , items } = req.body;

const transporter = nodemailer.createTransport({
host: process.env.EMAIL_HOST,
port: process.env.EMAIL_PORT,
secure: true,
auth:{
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASSWORD
}
});

const html = generateHTML(items);

await transporter.sendMail({
from: process.env.EMAIL_USER,
to: email,
subject: "ARAI Knowledge Center Modules",
html
});

res.json({success:true});

}catch(err){
console.log(err)
res.status(500).json({success:false})
}

};


const generateHTML = (data)=>{

return `
<p>Good Morning !</p>

<h3>ARAI KNOWLEDGE CENTER MODULES</h3>

${data.map(item=>`

<h4>${item.heading}</h4>

<table border="1" cellpadding="6" cellspacing="0">

<tr>
<th>SrNo</th>
<th>News Topic</th>
<th>Source</th>
<th>Link</th>
</tr>

${item.news.map(row=>`

<tr>
<td>${row.srno}</td>
<td>${row.newsTopic}</td>
<td>${row.source}</td>
<td><a href="${row.link}">Open</a></td>
</tr>

`).join("")}

</table>
<br/>

`).join("")}

`;
};