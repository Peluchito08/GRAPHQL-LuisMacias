//importar graphql y apollo server
import { ApolloServer, UserInputError, gql } from 'apollo-server';
//importar uuid para generar ids únicos
import { v1 as uuid } from 'uuid';

//Los datos con los que trabajaremos
const persons = [
    {
        name: "Midu",
        phone: "034-1234567",
        street: "Calle Fronted",
        city: "Barcelona",
        id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Youssef",
        phone: "044-123456",
        street: "Avenida Fullstack",
        city: "Mataro",
        id: "3d599650-3436-11e9-bc57-8b80ba54c431"
    },
    {
        name: "Leo",
        street: "Calle Argentina",
        city: "Buenos Aires",
        id: "3d596650-3436-11e9-bc57-8b80ba54c431"
    },
];

//Describimos los datos
//A pesar de no tener en la base de datos local un tipo Address, 
// lo definimos para estructurar mejor los datos y 
// es una de las cosas que GraphQL nos permite hacer,
// en este caso la función de los resolvers 
const typeDefs = gql`
    type Address {
        street: String!
        city: String!
    }

    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons: [Person]!
        findPerson(name: String!): Person
    }
   type Mutation {
    addPerson(
        name: String!
        phone: String!
        street: String!
        city: String!
    ): Person

    updatePerson(
        name: String!
        phone: String
        street: String
        city: String
    ): Person

    deletePerson(name: String!): Boolean
}
`
//Definimos los resolvers, que es como se resuelven las queries
const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: () => persons,
        findPerson: (root, args) => {
            const { name } = args
            return persons.find(person => person.name === name)
        }
    },

    //uuid para generar ids únicos
    Mutation: {
        addPerson: (root, args) => {
            if (persons.find(p => p.name === args.name)) {
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name
                })
            }
            //const (name, phone, street, city) = args
            const person = { ...args, id: uuid() }
            persons.push(person)
            return person
        },
        //Actualizar los datos de un persona
      updatePerson: (root, args) => {
            const person = persons.find(p => p.name === args.name);
            if (!person) {
                throw new UserInputError('Person not found', { invalidArgs: args.name });
            }

            if (args.phone !== undefined) person.phone = args.phone;
            if (args.street !== undefined) person.street = args.street;
            if (args.city !== undefined) person.city = args.city;

            return person;
        },
        //eliminar una persona por nombre
        deletePerson: (root, args) => {
            const index = persons.findIndex(p => p.name === args.name);
            if (index === -1) {
                throw new UserInputError('Person not found', { invalidArgs: args.name });
            }
            persons.splice(index, 1); // Elimina la persona del array
            return true; // Devuelve true si se eliminó correctamente
            }

    },

    //Resolver para el tipo Person y devolver el tipo Address
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city,
            }
        }
    }
};

//Creamos el servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})