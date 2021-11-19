// generate random but consistent users
// https://github.com/Marak/faker.js#setting-a-randomness-seed
const users = []

faker.seed(123)
for (let i = 0; i < 23; i++) {
  users.push({
    id: faker.random.number(1000),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    date: faker.date.past().toISOString().split('T')[0],
    points: faker.random.number(99),
  })
}
// pad the numbers with leading zeros
// because the sorting is alphanumeric only, does not work with numbers
const rows = users
  .map((user) => {
    return `
    <tr>
      <td>${String(user.id).padStart(4, '0')}</td>
      <td>${user.firstName}</td>
      <td>${user.lastName}</td>
      <td>${user.date}</td>
      <td>${String(user.points).padStart(2, '0')}</td>
    </tr>
  `
  })
  .join('\n')

$('.tablemanager tbody').html(rows)

$('.tablemanager').tablemanager({
  firstSort: [
    [3, 0],
    [2, 0],
    [1, 'asc'],
  ],
  disable: [],
  appendFilterby: true,
  dateFormat: [[3, 'yyyy-mm-dd']],
  debug: false,
  vocabulary: {
    voc_filter_by: 'Filter By',
    voc_type_here_filter: 'Filter...',
    voc_show_rows: 'Rows Per Page',
  },
  pagination: true,
  showrows: [5, 10, 20, 50, 100],
  disableFilterBy: [1],
})
