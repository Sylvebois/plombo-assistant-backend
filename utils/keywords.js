const toChange = {
  décimètres: 'dm',
  centimètres: 'cm',
  millimètres: 'mm',
  mètres: 'm',
  pouces: '"',
  décimètre: 'dm',
  centimètre: 'cm',
  millimètre: 'mm',
  mètre: 'm',
  pouce: '"',
  ' une ': ' ',
};

const toRemove = [
  `j'ai besoin`,
  `je cherche`,
  `je veux`,
  `je souhaite`,
  `je voudrais`,
  `quelles`,
  `quelle`,
  `quels`,
  `quel`
];

export { toRemove, toChange };