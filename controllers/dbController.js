const CommunityModels = require('../models/communityModels');

async function createCommunity(communityRequest){
    //communityRequest
    //function creates a community and saves it or returns an error
    //requires a superAdmin approver
    let result = {success: false,};
    
    //generate homes objects
    let homes = [];
    for(let i = communityRequest.homesStartingNumber; i <= communityRequest.homesEndingNumber; i++){
        homes.push({number: i});
    }
    let reservedIdentifiers = [];
    let beginningReservedString = '00000';
    for(let i = 0; i < 10; i++){
        reservedIdentifiers.push(beginningReservedString + i)
    }
    //create community
    let community = new CommunityModels.Community({

        name: communityRequest.name,
        votingUnit: communityRequest.votingUnit,
        address: communityRequest.address,
        homes: homes,
        reservedIdentifiers: reservedIdentifiers,
    });
    //La primera y segunda ley se agregan a la comunidad automaticamente
    let law1 = {title: 'Gobierno de la Comunidad', 
        identifier: '000001', 
        number: 1, 
        type: 'law', 
        status: 'active',
        statusUpdateDate: Date.now(),
    };
    if(community.votingUnit === 'homes.owner'){
        law1.body = "La comunidad operará como una democracia directa, " +
            "en la cual todos los propietarios tienen la oportunidad igual de participar " +
            "en el proceso de toma de decisiones. Cualquier residente de la comunidad, incluyendo " +
            "aquellos que no son propietarios, pueden crear propuestas para la comunidad, pero solo " +
            "los propietarios tienen derecho a votar. Una mayoría de votos de los propietarios se " +
            "considera como una propuesta aprobada."
            "\n\n" +
            "En esta forma de democracia directa, los propietarios pueden en cualquier momento 'desconectar'" +
            " su voto de una propuesta. Los votos pueden ser desconectados incluso de leyes, roles, permisos, " +
            "distintivos o proyectos aprobados. Si una propuesta pierde votos pero todavía está dentro del límite " +
            "de tiempo de propuesta establecido por esta constitución, entonces sigue siendo una propuesta y mantiene" +
            " los votos 'conectados' a favor. Si una ley, rol, medalla, permiso o proyecto aprobado pierde la " +
            "mayoría de votos después de ser aprobado, se vuelve inactivo. Una vez inactivo, todos los votos son " +
            "desconectados y si los ciudadanos desean votar sobre una propuesta similar de nuevo, debe ser recreada." +
            "\n\n"+
            "La comunidad utilizará la plataforma Democracia Conectada para facilitar este proceso, incluyendo pero " +
            "no limitado a la creación, discusión y votación de propuestas. La plataforma será considerada el medio " +
            "oficial de llevar a cabo los negocios de la comunidad." +
            "\n\n" +
            "Al residir en la comunidad, se entenderá que todos los propietarios han leído, comprendido y aceptado " +
            "cumplir con los términos y condiciones establecidos en esta ley.";
    } else if(community.votingUnit === 'community.citizens'){
        law1.body = "La comunidad operará como una democracia directa, en la cual todos los ciudadanos de la comunidad " +
            "tienen la oportunidad igual de participar en el proceso de toma de decisiones. Cualquier residente de la comunidad" +
            " puede crear propuestas para la comunidad, y todos los ciudadanos tienen derecho a votar. Un ciudadano no puede " +
            "conectar o desconectar mas de un voto por una propuesta, ley, rol, medalla, permiso o proyecto. Una mayoría de votos " +
            "de los ciudadanos se considera como una propuesta aprobada." +
            "\n\n" +
            "En esta forma de democracia directa, los ciudadanos tienen la posibilidad de retirar su voto de una propuesta " +
            "en cualquier momento, incluso después de que una propuesta haya sido aprobada. Si una propuesta pierde votos " +
            "antes del vencimiento del plazo establecido en esta constitución, seguirá siendo una propuesta activa y los votos" +
            " permanecerán conectados. Si una propuesta aprobada pierde la mayoría de los votos después de ser aprobada, sera " +
            "declarada inactiva y todos los votos serán retirados. En caso de querer volver a presentar una propuesta similar, " +
            "se deberá crear una nueva propuesta." +
            "\n\n" +
            "La comunidad utilizará la plataforma de Democracia Conectada para facilitar este proceso, incluyendo " +
            "pero no limitado a la creación, discusión y votación de propuestas. La plataforma será considerada el " +
            "medio oficial de llevar a cabo los negocios de la comunidad." +
            "\n\n" +
            "Al residir en la comunidad, se entenderá que todos los ciudadanos han leído, comprendido y aceptado " +
            "cumplir con los términos y condiciones establecidos en esta ley.";
    }
    let law2 = {title: 'Expiración de las Propuestas', 
        identifier: '000002', 
        number: 2, 
        type: 'law', 
        status: 'active',
        statusUpdateDate: Date.now(),
    };
    law2.body = "Todas las propuestas presentadas por los ciudadanos tendrán una fecha de expiración de " +
    "30 días a partir de la fecha de su publicación. Los ciudadanos pueden " +
    "votar para modificar esta ley y cambiar el plazo para votar en las propuestas. Cualquier modificación " +
    "debe ser aprobada por la mayoría de la comunidad. Si la modificación es aprobada, la nueva fecha de " +
    "expiración entrará en vigor de inmediato.";

    //add these laws to the community
    community.records.push(law1);
    community.records.push(law2);
    
    //add citizen as temporary admin for community 90 days
    let recordRole = {
        identifier: '000003',
        title: communityRequest.title,
        body: communityRequest.body,
        citizen: communityRequest.citizen,
        admin: true,
        expirationDate: Date.now() + 90*24*60*60*1000,
        statusUpdateDate: Date.now(),
        type: 'role',
        status: 'active',
    };

    community.records.push(recordRole);

    //save community
    try{
        await community.save();
        communityRequest.status = 'approved';
        await communityRequest.save();
        result.success = true;
        result.message = `Community ${community._id} created successfully`
        result.community = community;
    }
    catch(error){
        result.success = false;
        result.message = error;
    }

    return result;
}

async function createCitizen(user){
    let citizen = new CommunityModels.Citizen({
        firstName: user.firstName,
        lastName: user.lastName,
        secondLastName: user.secondLastName,
        dob: Date.now(),
        email: user.email,
        password: user.password,
        cellphone: user.cellphone,
    });
    let result;
    try{
        await citizen.save();
        result = citizen;
    }catch(error){
        result = error;
    }
    return result;
}

module.exports = {
    createCommunity,
    createCitizen,
}