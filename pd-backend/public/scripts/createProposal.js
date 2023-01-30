$('#community').on('change', function() {
    $('#proposalType').removeAttr('disabled');
    blankForm();
})

$('#proposalType').on('change', async function() {
    blankForm();
    let proposalType = $('#proposalType option:selected').val();
    
    switch(proposalType){
        case 'createLaw':
            $('#titleDiv').removeClass('d-none');
            $('#bodyDiv').removeClass('d-none');

            $('#citizenActionTitleDiv').removeClass('d-none');
            $('#citizenActionTitleLabel').text("Titulo de la ley");
            $('#citizenActionTitle').attr('placeholder','Como aparecera el titulo de la ley como tan en la constitucion de la comunidad.')

            $('#citizenActionBodyDiv').removeClass('d-none');
            $('#citizenActionBodyLabel').text('Texto de la ley');
            $('#citizenActionBody').attr('placeholder', 'Escribe el texto de la ley como estara en la constitucion de la privada.')
            
            $('#citizenActionStartDateDiv').removeClass('d-none');
            $('#citizenActionStartDateLabel').text('Fecha en que la ley tomara efecto (opcional). Sin fecha, la ley toma efecto inmediatamente que la propuesta pase.');

            $('#citizenActionExpirationDateDiv').removeClass('d-none');
            $('#citizenActionExpirationDateLabel').text('Fecha en que expiraria la ley (opcional). Sin fecha de expiracion, la ley permanece permanentemente hasta que se vote para removerla.');
            break;
        case 'deleteLaw':
            $('#titleDiv').removeClass('d-none');
            $('#bodyDiv').removeClass('d-none');

            $('#CitizenActionDocumentLabel').text('Seleccion la ley que deseas eliminar');
            let laws = getCitizenActionDocuments();
            fillCitizenActionDocuments(laws);

            break;
        case 'editLaw':
            break;
        case 'createRole':
            break;
        case 'deleteRole':
            break;
        case 'editRole':
            break;
        case 'assignRole':
            break;
        case 'removeRole':
            break;
        case 'swapRole':
            break;
        case 'createProject':
            break;
        case 'createBadge': 
            break;
        case 'assignBadge': 
            break;
        case 'permit':
            break;
        
    }
    
});

function blankForm(){
    $('#titleDiv').addClass('d-none');
    $('#bodyDiv').addClass('d-none');
    
    $('#citizenActionDocumentDiv').addClass('d-none');
    $('#citizenActionDocumentLabel').empty();
    $('#citizenActionDocument').empty()

    $('#citizenActionTitleDiv').addClass('d-none');
    $('#citizenActionTitleLabel').empty();
    $('#citizenActionTitle').empty();

    $('#citizenActionBodyDiv').addClass('d-none');
    $('#citizenActionBodyLabel').empty();
    $('#citizenActionBody').empty();

    $('#citizenActionStartDateDiv').addClass('d-none');
    $('#citizenActionStartDateLabel').empty();
    $('#citizenActionStartDate').val('');

    $('#citizenActionExpirationDateDiv').addClass('d-none');
    $('#citizenActionExpirationDateLabel').empty();
    $('#citizenActionExpirationDate').val('');

    $('#citizenActionPayDiv').addClass('d-none');
    $('#citizenActionPayLabel').empty();
    $('#citizenActionPay').empty();

    $('#citizenActionVolunteersAmountDiv').addClass('d-none');
    $('#citizenActionVolunteersAmountLabel').empty();
    $('#citizenActionVolunteersAmount').empty();

    $('#citizenActionRewardBadgesDiv').addClass('d-none');
    $('#citizenActionRewardBadgesLabel').empty();
    $('#citizenActionRewardBadges').empty();
    $('#citizenActioNRewardBadges').append('<option disabled selected>Elige medallas</option>')

    $('#citizenActionBadgeImageDiv').addClass('d-none');
    $('#citizenActionBadgeImageLabel').empty();
    $('#citizenActionBadge').empty();
    $('#citizenActionBadge').append('<option disabled selected>Elige imagen para medalla</option>')
}

function getCitizenActionDocuments(){
let documents;
$.ajax({
    url: '/mycommunity/createproposal/getcitizenactiondocuments',
    data: {
        community: $('communities').val(),
        type: $('#proposalType option:selected').val()
    },
    type: 'GET',
    dataType: "json",
    cache: false,
    success: function(data) {
        documents = data;
    },
    error: function(){
        $('h1.pageTitle').html('error');
    }
})
return documents;
}

function fillCitizenActionDocuments(documents){
    for(let i = 0; i < documents.length; i++){
        $('#citizenActionDocument').append($('<option></option>').val(documents[i].id).text(documents[i].title));
    }
}