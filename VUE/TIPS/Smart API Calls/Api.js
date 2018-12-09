
import axios from 'axios'

class API {

    constructor({ url }) {
        this.url = url
        this.endpoints = {}
    }

    /**
     * Create and store a single entity's endpoints
     * 
     * @param {*Entity Object} entity 
     */
    createEntity(entity) {
        this.endpoints[entity.name] = this.createEndpoints(entity)
    }

    createEntities(entityArr) {
        entityArr.forEach(entity => this.createEntity(entity));
    }

    /**
     * Create basic enpoints handlers for CRUD operations
     *
     * @param {*} { name }
     */
    createEndpoints({ name, isPhp }) {
        const php = isPhp ? 'create.php' : '';
        // This only works in case you want to create a category based on the REST API I have created
        // Can be found in one of my repos
        // Here I'm just trying things..
        php !== '' ? name += '/' +  php: null;
        const URI = `${this.url}/${name}`

        return {
            getAll: ({ query } = {}) => axios.get(URI, { params: { query } }),
            getOne: ({ id }, config = {}) => axios.get(`${URI}/${id}`, config),
            create: (data) => axios.post(URI, data),
            update: (data, config ={}) => axios.put(`${URI}/${data.id}`, data, config),
            delete: ({ id }, config) => axios.delete(`${URI}/${id}`, config) 
        }
    }

    getEndpoints() {
        return this.endpoints;
    }
}

export default API