export const GetCardColor = (owner) => {
    if (owner === 0) return 'bg-indigo-700';
    if (owner === 1) return 'bg-red-700';
    if (owner === 2) return 'bg-black-700';
    if (owner === 3 ) return 'bg-orange-200';
    if (owner === -1) return 'bg-yellow-200';
    return 'bg-gray-700';
}