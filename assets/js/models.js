// data models for our application
// define it in a dict-like structure
const models = {
    user: {
        id: 'number',
        name: 'string',
        email: 'string',
        createdAt: 'date'
    },
    report: {
        id: 'number',
        userId: 'number',   
        date: 'date',
        totalTime: 'number',
        attachment: 'string',   
        tasks: 'array' // array of task objects
    },
    task: {
        id: 'number',
        time: 'number',
        description: 'string'
    }
};