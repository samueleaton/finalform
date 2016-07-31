/* eslint-disable */
describe('finalform.merge', function() {
  it('should return an empty object if no arguments', function() {
    expect(finalform.merge()).to.eql({});
  });

  it('should return an empty object if passed empty objects', function() {
    expect(finalform.merge({})).to.eql({});
    expect(finalform.merge({}, {})).to.eql({});
    expect(finalform.merge({}, {}, {})).to.eql({});
    expect(finalform.merge({}, {}, {}, {})).to.eql({});
  });

  it('should not change deep props', function() {
    expect(finalform.merge({
      person: {
        name: 'Finn',
        isHuman: true
      }
    }, {
      animal: {
        name: 'Jake',
        color: 'yellow'
      }
    })).to.eql({
      person: {
        name: 'Finn',
        isHuman: true
      },
      animal: {
        name: 'Jake',
        color: 'yellow'
      }
    });
  });

  it('should flatten arrays', function() {
    const original = finalform.merge(
      [{name: 'Finn'}, {age: 16}], {species: 'human'}
    );

    const result = {
      name: 'Finn',
      age: 16,
      species: 'human'
    };

    expect(original).to.eql(result);
  });

  it('should keep the later of repeated properties', function() {
    const original = finalform.merge(
      [{name: 'Finn'}, {age: 16}],
      {kingdom: 'Ooo'},
      {species: 'human'},
      {species: 'dog'},
      {name: 'Jake'},
      {age: 20, color: 'yellow'}
    );

    const result = {
      name: 'Jake',
      age: 20,
      kingdom: 'Ooo',
      species: 'dog',
      color: 'yellow'
    };

    expect(original).to.eql(result);
  });
});