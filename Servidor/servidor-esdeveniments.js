var http = require('http');
var url = require('url');
var queryString = require('querystring');
var fs = require('fs');

const NOM_FITXER = 'esdeveniments.json';
const INDEX_RECURS = 0;
const INDEX_IDENTIFICADOR = 1;

var server;
var dadesAplicacio;

inicialitzar();

function inicialitzar() {
    server = http.createServer();

    carregarDadesJSON(NOM_FITXER);

    server.on('request', function (peticio, resposta) {
        resposta.setHeader('Access-Control-Allow-Origin', '*');
        resposta.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        resposta.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});

        var cos = '';
        peticio.on('data', function (dades) {
            cos += dades;

        }).on('end', function () {
            var params;
            var dades;

            if (peticio.method === 'GET') {
                dades = url.parse(peticio.url).query;
            } else {
                dades = cos;
            }
            params = queryString.parse(dades);

            var urlEncaminament = (url.parse(peticio.url).path).substr(1);
            encaminar(urlEncaminament, peticio.method, resposta, params);
            resposta.end();

        });
    });

    server.listen(8080, "139.59.153.134");
}

function encaminar(url, metode, resposta, params) {
    var contingutResposta = {};
    var fragmentsUrl = url.split('/');

    switch (fragmentsUrl[INDEX_RECURS]) {
        case 'esdeveniments':
            contingutResposta.accions = controladorEsdeveniments(metode, fragmentsUrl[INDEX_IDENTIFICADOR], params);
            break;

        default:
            contingutResposta.accions = [];
            afegirNotificacio(contingutResposta.accions, 'error', 'No es reconeix el recurs ' + fragmentsUrl[INDEX_RECURS]);
    }

    resposta.write(JSON.stringify(contingutResposta));
}

function controladorEsdeveniments(metode, id, params) {
    var accions = [];

    switch (metode) {
        case 'GET':
            afegirNotificacio(accions, 'info', 'Carregat llistat d\'esdeveniments.');
            afegirLlistat(accions);
            break;

        case 'POST':
            params.id = dadesAplicacio.proximIdentificador;
            dadesAplicacio.llistatEsdeveniments[dadesAplicacio.proximIdentificador++] = params;

            desarDadesJSON('esdeveniments.json', dadesAplicacio);
            afegirNotificacio(accions, 'exit', 'Nou esdeveniment afegit.');
            afegirLlistat(accions);
            break;

        case 'DELETE':
            delete(dadesAplicacio.llistatEsdeveniments[id]);
            desarDadesJSON('esdeveniments.json', dadesAplicacio);
            afegirNotificacio(accions, 'info', 'Esdeveniment eliminat.');
            afegirLlistat(accions);
            break;

        case 'PUT':
            dadesAplicacio.llistatEsdeveniments[id] = params;
            desarDadesJSON('esdeveniments.json', dadesAplicacio);
            afegirNotificacio(accions, 'exit', 'Esdeveniment actualitzat.');
            afegirLlistat(accions);
            break;

        default:
            afegirNotificacio(accions, 'error', 'No es reconeix el mètode ' + metode);
    }

    return accions;
}

function afegirNotificacio(contingutResposta, tipus, missatge) {
    contingutResposta.push({
        accio: 'mostrar-notificacio',
        notificacio: {
            tipus: tipus,
            missatge: missatge
        }
    })
}

function afegirLlistat(contingutResposta) {
    contingutResposta.push({
        accio: 'establir-llistat',
        esdeveniments: dadesAplicacio.llistatEsdeveniments
    });
}


function desarDadesJSON(fitxer, dades) {
    fs.writeFile(fitxer, JSON.stringify(dades), function (error) {
        if (error) {
            console.error('Error en desar el fitxer');
            throw err;
        }
    });
}

function carregarDadesJSON(fitxer) {
    fs.readFile(fitxer, 'utf8', function (err, dades) {
        if (err) {
            console.log('No existeix el fitxer de dades, creant nou conjunt de dades...');
            dadesAplicacio = {
                proximIdentificador: 0,
                llistatEsdeveniments: {}
            };
        } else {
            dadesAplicacio = JSON.parse(dades);
        }
    });
}


