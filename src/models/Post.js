const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs'); // Lib que lida com arquivos: para deletar, ler, criar.
const path = require('path'); 

const { promisify } = require('util'); // Converte uma função que utiliza a forma antiga de cb para lidar 
                                            // Com funções assincronas que a fs utiliza para a nova forma

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
    name: String, 
    size: Number,
    key: String, // Nome que geramos com o hash
    url: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

PostSchema.pre('save', function() { // Funções com => não consigo pegar nada do this
    if (!this.url){
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }
});

PostSchema.pre('remove', function() { // Funções com => não consigo pegar nada do this
    if (process.env.STORAGE_TYPE === 's3'){
        return s3.deleteObject({
            Bucket: 'upload-exemple-lta', 
            Key: this.key
        }).promise()
    }
    else{
        return promisify(fs.unlink)(path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key));
    }
});

module.exports = mongoose.model("Post", PostSchema);