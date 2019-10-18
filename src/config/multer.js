const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
        },
        // Para não haver o risco de ter uploads de imagens com nomes iguais, uso essa
            // Configuração onde salvo a imagem com 16 bytes aleatórios antes do nome
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err)
                    cb(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            });
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'upload-exemple-lta',
        contentType: multerS3.AUTO_CONTENT_TYPE, // Le o tipo do arquivo que esta sendo enviado e atribui como contentType para não forçar o download
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err)
                    cb(err);

                const fileName = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, fileName);
            });
        }
    })
};

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'), // Destino dos arquivos quando fizermos upload
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type."));
        }
    }
};