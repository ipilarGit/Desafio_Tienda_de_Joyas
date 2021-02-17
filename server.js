const express = require("express");
const joyas = require("./data/joyas.js");
const app = express();
app.listen(3000, () => console.log("Servidor iniciado en puerto 3000"));

/* 
app.get("/", (req, res) => {
    res.send("Oh wow! this is working =)");
});
*/

//Req.1: Crear una ruta para la devolucion de todas las joyas con HATEOAS
app.get("/", (req, res) => {
    console.log("joyas:", joyas);
    res.send(joyas);
});

const HATEOAS = () =>
    joyas.map((j) => {
        return {
            id: j.id,
            name: j.name,
            href: `http://localhost:3000/joya/${j.id}`,
        };
    });

app.get("/joyas", (req, res) => {
    res.send({
        joyas: HATEOAS(),
    });
});

const getJoya = (id) => {
    const joyaEncontrada = joyas.find((j) => j.id == id);
    const joyita = Object.assign({}, joyaEncontrada);
    return joyita ? Object.assign({}, joyaEncontrada) : false;
};

app.get("/joya/:id", (req, res) => {
    const { id } = req.params;
    getJoya(id) ?
        res.send(getJoya(id)) :
        res.status(404).send({
            error: "404 Not found",
            message: "Joya no encontrada",
        });
});

// Req.2: Hacer una segunda versión de la API que ofrezca los
// mismos datos pero con los nombres de las propiedades diferentes

const HATEOASV2 = () =>
    joyas.map((j) => {
        return {
            id: j.id,
            nombre: j.name,
            src: `http://localhost:3000/joya/${j.id}`,
        };
    });

app.get("/api/v2/joyas", (req, res) => {
    res.send({
        joyas: HATEOASV2(),
    });
});

// Req.3: La API REST debe poder ofrecer una ruta con la
// que se puedan filtrar las joyas por categoría

const filtroByCategory = (category) => {
    return joyas.filter((j) => j.category === category);
};

app.get("/api/v2/category/:categoria", (req, res) => {
    const { categoria } = req.params;
    res.send({
        cant: filtroByCategory(categoria).length,
        guitarras: filtroByCategory(categoria),
    });
});

// Req.4: Crear una ruta que permita el filtrado por campos
// de una joya a consultar.

// http://localhost:3000/api/fields/joya/1?fields=id,name,metal

/* let fieldsSelect = (id, fields) => {
    const joya = Object.assign({}, getJoya(id));
    for (propiedad in joya) {
        if (!fields.includes(propiedad)) delete joya[propiedad];
    }
    return joya;
};

app.get("/api/fields/joya/:id", (req, res) => {
    const { id } = req.params;
    const { fields } = req.query;
    res.send(fieldsSelect(id, fields.split(",")))
});
 */
// Req.5: Crear una ruta que devuelva como payload un JSON con un
// mensaje de error cuando el usuario consulte el id
// de una joya que no exista
// http://localhost:3000/api/fields/joya/10

let fieldsSelect = (joya, fields) => {
    for (propiedad in joya) {
        if (!fields.includes(propiedad)) delete joya[propiedad];
    }
    return joya;
};

app.get("/api/fields/joya/:id", (req, res) => {
    const { id } = req.params;
    const { fields } = req.query;
    console.log(fields);
    if (fields)
        return res.send({
            joya: fieldsSelect(
                getJoya(id),
                fields.split(","))
        });

    getJoya(id) ?
        res.send({
            joya: getJoya(id),
        }) :
        res.status(404).send({
            error: "404 Not Found",
            message: "No existe una joya con ese ID",
        });
});

// Req.6: Permitir hacer paginación de las joyas usando Query Strings
// http://localhost:3000/api/joyas?page=2






// Req.7: Permitir hacer ordenamiento de las joyas según su
// valor de forma ascendente o descendente usando Query Strings.

const orderValues = (order) => {
    return order == "asc" ?
        joyas.sort((a, b) => (a.value > b.value ? 1 : -1)) :
        order == "desc" ?
        joyas.sort((a, b) => (a.value < b.value ? 1 : -1)) :
        false;
};

app.get("/api/v2/joyas", (req, res) => {
    const { values } = req.query;
    if (values == "asc") return res.send(orderValues("asc"));
    if (values == "desc") return res.send(orderValues("desc"));
    if (req.query.page) {
        const { page } = req.query;
        return res.send({
            joyas: HATEOASV2().slice(page * 2 - 2, page * 2),
        });
    }
    res.send({
        joyas: HATEOASV2(),
    });
});