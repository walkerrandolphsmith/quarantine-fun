function fisherYates(array, numberOfPicks)
{
    const clone = array.slice();
    for (let i = clone.length-1; i > 1  ; i--)
    {
        const r = Math.floor(Math.random()*i);
        const t = clone[i];
        clone[i] = clone[r];
        clone[r] = t;
    }

    return clone.slice(0, numberOfPicks);
}

exports.fisherYates = fisherYates;