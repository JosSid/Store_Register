"use strict";

require("dotenv").config();

const readline = require("readline");

// conectar a la base de datos
const connection = require("./lib/connectMongoose");

// cargar los modelos
const { User } = require("./models");

async function main() {
  await connection.$initialConnection;
  const continuar = await pregunta(
    "Estas seguro, seguro, seguro, de que quieres borrar toda la base de datos y cargar datos iniciales (si/NO): "
  );
  if (!continuar) {
    process.exit();
  }

  //Import Data File
  const adsFile = require("./baseData.json");

  //Inicializamos la colección de usuarios
  await initUsers(adsFile.users);

  connection.close();
}

main().catch((err) => console.log("Hubo un error:", err));

async function initUsers(data) {
  // borrar todos los documentos de usuarios
  const deleted = await User.deleteMany();
  console.log(`Eliminados ${deleted.deletedCount} usuarios.`);

  let newData = [...data];

  const userName = process.env.ADMIN_USERNAME;
  const mail = process.env.ADMIN_MAIL;
  const password = await User.hashPassword(process.env.ADMIN_PASSWORD);

  // crear usuarios iniciales
  for (let index = 0; index < newData.length; index++) {
    newData[index].username = userName;
    newData[index].mail = mail;
    newData[index].password = password;
    newData[index].creation = new Date().toUTCString();
    newData[index].update = new Date().toUTCString();
  }

  const inserted = await User.insertMany(newData);
  console.log(`Creados ${inserted.length} usuarios.`);
}


function pregunta(texto) {
  return new Promise((resolve, reject) => {
    const ifc = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    ifc.question(texto, (respuesta) => {
      ifc.close();
      if (respuesta.toLowerCase() === "si") {
        resolve(true);
        return;
      }
      resolve(false);
    });
  });
}