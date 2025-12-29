const mongoose = require('mongoose');

const clientOptions = {
    dbname: 'port-russell'
}

exports.initClientDbConnection = async () => {
    try {
        /**
         * ATTENTION
         * On essaie de se connecter à MongoDB en utilisant la variable d'environnement URL_MONGO
         * Il faut donc ne pas oublier de l'ajouter au fichier .env
         * URL_MONGO prends pour valeur la chaine de connexion de votre cluster mongoDB
         */
        await mongoose.connect(process.env.URL_MONGO, clientOptions);
        console.log('Connexion à MongoDB établie');
    } catch (error) {
        console.error(error);
        throw error;
    }
}