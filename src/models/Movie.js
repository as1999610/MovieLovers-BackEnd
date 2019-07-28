import mongoose from 'mongoose';

const schema = new mongoose.Schema ({
    title: {type: String, required: true},
    director: {type: String, required: true},
    mainActor: {type: String, required: true},
    goodWatchId: {type: String},
    duration: {type: Number, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true}
})

export default mongoose.model('Movie', schema)