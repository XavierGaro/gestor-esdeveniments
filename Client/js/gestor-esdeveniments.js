var GESTOR_ESDEVENIMENTS = (function () {

    var paginaMostradaActualment;
    var llistatEsdeveniments;

    function enviarPeticio(metode, url, params) {
        $.ajax({
            url: url,
            data: params,
            dataType: 'json',
            type: metode,

            error: function () {
                accioMostrarNotificacio('error', 'S\'ha produït un error en fer la petició al servidor');
            },

            success: function (dades) {
                processarResposta(dades);
            }
        });
    }

    function processarAccio(accio, dades) {
        switch (accio) {
            case 'establir-llistat':
                accioEstablirLlistat(dades.esdeveniments);
                break;

            case 'mostrar-notificacio':
                accioMostrarNotificacio(dades.notificacio.tipus, dades.notificacio.missatge);
                break;

            case 'mostrar-pagina':
                accioMostrarPagina(dades.pagina);
                break;

            case 'mostrar-actualitzar':
                establirEsdevenimentActualitzar(llistatEsdeveniments[dades.id], 'actualitzar');
                accioMostrarPagina('paginaActualitzar');
                break;

            case 'mostrar-detall':
                establirEsdevenimentDetall(llistatEsdeveniments[dades.id], 'detall');
                accioMostrarPagina('paginaDetall');
                break;

            case 'mostrar-llistat':
                netejarFormularis();
                accioMostrarPagina('paginaLlistat');
                break;

            case 'mostrar-alta':
                netejarFormularis();
                accioMostrarPagina('paginaAlta');
                break;

            case 'eliminar':
                enviarPeticio('DELETE', 'http://139.59.153.134:8080/esdeveniments/' + dades.id);
                break;

            case 'actualitzar':
                dades.esdeveniment = obtenirEsdevenimentDelFormulari('formulariActualitzar');
                dades.esdeveniment.id = dades.id;
                enviarPeticio('PUT', 'http://139.59.153.134:8080/esdeveniments/' + dades.id, dades.esdeveniment);
                break;

            case 'alta':
                dades.esdeveniment = obtenirEsdevenimentDelFormulari('formulariAlta');
                enviarPeticio('POST', 'http://139.59.153.134:8080/esdeveniments', dades.esdeveniment);
                break;

            case 'filtrar':
                accioFiltrar();
                break;

            default:
                console.error('Acció desconeguda: ', accio);
        }
    }

    function processarResposta(dades) {

        for (var i = 0; i < dades.accions.length; i++) {
            processarAccio(dades.accions[i].accio, dades.accions[i])
        }
    }

    function processarBoto(e) {
        e.preventDefault();

        var $boto = $(this);
        var accio = $boto.attr('data-accio');
        var id = $boto.attr('data-id');
        var dades = {
            $boto: $boto,
            id: id
        };

        processarAccio(accio, dades);
    }

    function accioMostrarNotificacio(tipus, missatge) {
        var $notificacions = $('#notificacions');
        $notificacions.removeClass();
        $notificacions.addClass(tipus);
        $notificacions.html(missatge);
    }

    function accioMostrarPagina(novaPagina) {
        $('#' + paginaMostradaActualment).addClass('amaga');
        paginaMostradaActualment = novaPagina;
        $('#' + paginaMostradaActualment).removeClass('amaga');
    }

    function accioEstablirLlistat(dades) {
        llistatEsdeveniments = dades;
        omplirTaulaLlistat(dades);
        accioMostrarPagina('paginaLlistat');
    }

    function accioFiltrar() {
        var $filtre = $('input[name="filtre"]');
        var terme = $filtre.val();

        if (terme.indexOf(' ') !== -1) {
            accioMostrarNotificacio('error', 'Només es pot introduir una paraula per filtrar');
        } else if (!terme) {
            accioMostrarNotificacio('info', 'Desactivat el filtre');
            omplirTaulaLlistat(llistatEsdeveniments);
        } else {
            filtrarEsdeveniments(terme);
            $filtre.val('');
        }
    }

    function omplirTaulaLlistat(dades) {
        var $cosTaula = $('tbody');

        // Es neteja el cos del llistat
        $cosTaula.empty();

        // Es recorren les dades
        for (var i in dades) {

            // Es genera la fila i les columnes
            var $fila = $('<tr>');
            var $col1 = $('<td>');
            var $col2 = $('<td>');
            var $col3 = $('<td>');
            var $col4 = $('<td>');


            // S'afegeix el contingut a cada columna a partir de la informació del llistat de dadees
            $col1.html(dades[i].nom);
            $col2.html(dades[i].data);
            $col3.html(dades[i].organitzador);

            var $botoDetall = $('<button>Detall</button>');
            $botoDetall.attr('data-id', dades[i].id);
            $botoDetall.attr('data-accio', 'mostrar-detall');

            var $botoActualitzar = $('<button>Actualitzar</button>');
            $botoActualitzar.attr('data-id', dades[i].id);
            $botoActualitzar.attr('data-accio', 'mostrar-actualitzar');

            var $botoEliminar = $('<button>Eliminar</button>');
            $botoEliminar.attr('data-id', dades[i].id);
            $botoEliminar.attr('data-accio', 'eliminar');

            $col4.append($botoDetall);
            $col4.append($botoActualitzar);
            $col4.append($botoEliminar);

            // S'afegeixen les columnes a la fila
            $fila.append($col1);
            $fila.append($col2);
            $fila.append($col3);
            $fila.append($col4);

            // S'afegeix la fila al cos de la taula
            $cosTaula.append($fila);
        }

        // S'afegeix un detector d'events a tots els botons
        $('table button').on('click', processarBoto);
    }

    function filtrarEsdeveniments(terme) {
        var llistatFiltrat = [];

        for (var i in llistatEsdeveniments) {
            if (llistatEsdeveniments[i].nom.indexOf(terme) !== -1
                || llistatEsdeveniments[i].descripcio.indexOf(terme) !== -1
                || llistatEsdeveniments[i].organitzador.indexOf(terme) !== -1
            ) {
                llistatFiltrat.push(llistatEsdeveniments[i]);
            }
        }

        omplirTaulaLlistat(llistatFiltrat);

        if (llistatFiltrat.length === 0) {
            accioMostrarNotificacio('alerta', 'No s\'ha trobat cap resultat');
        } else {
            accioMostrarNotificacio('exit', 'Llistat filtrat pel terme "' + terme + '".');
        }
    }

    function obtenirEsdevenimentDelFormulari(idFormulari) {
        var $form = $('form#' + idFormulari);

        return {
            nom: $form.find('input[name="nom"]').val(),
            descripcio: $form.find('textarea').val(),
            data: $form.find('input[name="data"]').val(),
            organitzador: $form.find('select').val()
        }
    }

    function establirEsdevenimentActualitzar(esdeveniment) {
        var $form = $('form');

        $form.find('input[name="nom"]').val(esdeveniment.nom);
        $form.find('textarea').val(esdeveniment.descripcio);
        $form.find('input[name="data"]').val(esdeveniment.data);
        $form.find('select').val(esdeveniment.organitzador);
        $form.find('[data-accio="actualitzar"]').attr('data-id', esdeveniment.id);
    }

    function establirEsdevenimentDetall(esdeveniment) {
        $('#detallNom').html(esdeveniment.nom);
        $('#detallDescripcio').html(esdeveniment.descripcio);
        $('#detallData').html(esdeveniment.data);
        $('#detallOrganitzador').html(esdeveniment.organitzador);

        $('[data-accio="mostrar-actualitzar"]').attr('data-id', esdeveniment.id);
    }

    function netejarFormularis() {
        $('form').trigger('reset');
    }

    return {
        iniciarAplicacio: function () {
            $('button').on('click', processarBoto);
            enviarPeticio('GET', 'http://139.59.153.134:8080/esdeveniments');
        }
    }

})();

$(document).ready(function () {
    GESTOR_ESDEVENIMENTS.iniciarAplicacio();
});
