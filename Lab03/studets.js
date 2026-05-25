// ============================================================
// Завдання 3 — Менеджер студентів
// ============================================================
// Реалізуйте функції ЧЕРЕЗ map/filter/reduce, не через for.
// ============================================================

const students = [
  { name: "Олена",   age: 19, grades: [82, 91, 75], group: "ІПЗ-1" },
  { name: "Іван",    age: 20, grades: [55, 68, 72], group: "ІПЗ-2" },
  { name: "Марія",   age: 19, grades: [95, 88, 92], group: "ІПЗ-1" },
  { name: "Андрій",  age: 21, grades: [60, 65, 58], group: "ІПЗ-2" },
  { name: "Софія",   age: 19, grades: [78, 82, 80], group: "ІПЗ-1" },
  { name: "Михайло", age: 20, grades: [45, 52, 48], group: "ІПЗ-2" },
  { name: "Анна",    age: 20, grades: [88, 90, 85], group: "ІПЗ-1" },
  { name: "Петро",   age: 19, grades: [70, 75, 72], group: "ІПЗ-2" },
  { name: "Юлія",    age: 21, grades: [95, 98, 92], group: "ІПЗ-1" },
  { name: "Дмитро",  age: 19, grades: [62, 58, 65], group: "ІПЗ-2" },
];

/**
 * Повертає масив імен.
 */
function getNames(students) {
  return students.map(student => student.name);
}

/**
 * Повертає лише студентів з вказаної групи.
 */
function getByGroup(students, group) {
  return students.filter(student => student.group === group);
}

/**
 * Повертає n студентів з найвищим середнім балом, відсортовано спадно.
 * Повертає об'єкти у форматі { name, average }.
 */
function topStudents(students, n = 3) {
  return students.map(student => {
    const sum = student.grades.reduce((acc, grades) => acc + grades, 0);
    const average = sum / student.grades.length;
    const roundedAvarege = Number(average.toFixed(1));
    return {name: student.name, average: roundedAvarege};
  })
  .sort((a, b) => b.average - a.average)
  .slice(0,n);
}

/**
 * Групує студентів за вказаним ключем.
 * groupBy(students, "group") // { "ІПЗ-1": [...], "ІПЗ-2": [...] }
 */
function groupBy(students, key) {
  return students.reduce((acc, student) => {
    const groupKey = student[key];
    if(!acc[groupKey]){
      acc[groupKey] = [];
    }
    acc[groupKey].push(student);
    return acc;
  }, {});
}

/**
 * Повертає НОВИЙ масив, у якому до студента з ім'ям name
 * додано оцінку newGrade. Не мутувати оригінал!
 */
function addGrade(students, name, newGrade) {
  return students.map(student => {
    if(student.name === name){
      return{...student, grades: [...student.grades, newGrade]};
    }
    return student;
  })
}

// ============================================================
// Тестування
// ============================================================
console.log("Імена:", getNames(students));
console.log("ІПЗ-1:", getByGroup(students, "ІПЗ-1"));
console.log("Топ-3:", topStudents(students, 3));
console.log("За групою:", groupBy(students, "group"));
//
const before = JSON.stringify(students[0].grades);
const updated = addGrade(students, "Олена", 100);
const after = JSON.stringify(students[0].grades);
console.log("Оригінал не змінений?", before === after); // має бути true