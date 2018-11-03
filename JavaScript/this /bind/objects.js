

function Person(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.getName = function () {
        let name = `${this.firstName} ${this.lastName}`;
        return name;
    }
    this.setName = function (fName, lName) {
        this.firstName = fName;
        this.lastName = lName;
    }
}

let person1 = new Person("Andrei","Gatej");
let person2 = new Person("Vasile","Dan");


console.log(person1.getName());

// Call the method from "person2" object, having "person1" as this
person2.setName.bind(person1)("Name","Changed");
console.log(person1.getName());


