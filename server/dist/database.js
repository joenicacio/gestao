import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'db.json');
export class Database {
    constructor() {
        this.data = {
            clientes: [],
            version: '1.0.0'
        };
        this.load();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    load() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
                this.data = JSON.parse(fileContent);
            }
            else {
                this.save();
            }
        }
        catch (error) {
            console.error('Erro ao carregar database:', error);
            this.data = { clientes: [], version: '1.0.0' };
        }
    }
    save() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
            console.error('Erro ao salvar database:', error);
        }
    }
    getAllClientes() {
        return this.data.clientes;
    }
    getClienteById(id) {
        return this.data.clientes.find(c => c.id === id);
    }
    createCliente(cliente) {
        this.data.clientes.push(cliente);
        this.save();
        return cliente;
    }
    updateCliente(id, clienteAtualizado) {
        const index = this.data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.data.clientes[index] = clienteAtualizado;
            this.save();
            return clienteAtualizado;
        }
        return undefined;
    }
    deleteCliente(id) {
        const index = this.data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.data.clientes.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
    deleteAllClientes() {
        this.data.clientes = [];
        this.save();
    }
}
//# sourceMappingURL=database.js.map