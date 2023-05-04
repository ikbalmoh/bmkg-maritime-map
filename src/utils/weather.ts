export const weatherColor = (type: string) => {
  switch (type) {
    case 'tenang':
      return '#4ba3f4';
    case 'rendah':
      return '#2b964b';
    case 'sedang':
      return '#Ffe000';
    case 'tinggi':
      return '#fd8436';
    case 'sangat tinggi':
      return '#c32b01';
    case 'ekstrim':
      return '#ef38ce';
    default:
      return '#eee';
  }
};
