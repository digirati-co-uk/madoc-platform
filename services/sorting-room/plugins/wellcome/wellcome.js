
$(function() {
    $('#imfeelinglucky').bind('click', ImFeelingLucky);
    $('.typeahead').typeahead({
        minLength: 4,
        highlight: true
    },
    {
        name: 'flat-manifs',
        source: getFlatManifestations,
        async: true,
        limit: 50,
        display: formatFlatManifestation
    });
    $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
        loadSuggestion(suggestion);
    });
    $('.typeahead').bind('typeahead:asyncrequest', function(ev) {
        $('#typeaheadWait').show();
    });
    $('.typeahead').bind('typeahead:render', function(ev) {
        $('#typeaheadWait').hide();
    });
});

var gfmTimeout;
var urlRoot = "http://library-uat.wellcomelibrary.org";

function loadSuggestion(suggestion){
    window.location.href = window.location.pathname + "?manifest=" + urlRoot + "/iiif/" + suggestion.id + "/manifest";
}

function getFlatManifestations(query, syncResults, asyncResults) {
    if (gfmTimeout) {
        clearTimeout(gfmTimeout);
    }
    gfmTimeout = setTimeout(function () {
        console.log('autocomplete - ' + query);
        $.ajax(urlRoot + "/service/bNumberSuggestion?q=" + query).done(function (results) {
            asyncResults(results);
        });
    }, 300);
}

function ImFeelingLucky(){
    $.ajax(urlRoot + "/service/bNumberSuggestion?q=imfeelinglucky").done(function (results) {
        loadSuggestion(results[0]);    
    });
}

function formatFlatManifestation(fm) {
    return fm.id + " | " + fm.label;
}