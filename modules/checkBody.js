// Vérifie que tous les champs requis sont présents et non vides
function checkBody(body, keys) {
  let isValid = true; // On part du principe que le body est valide
  for (const field of keys) {
    // Si le champ est absent ou vide, le body est invalide
    if (!body[field] || body[field] === '') {
      isValid = false;
    }
  }
  return isValid;
}

module.exports = { checkBody };
