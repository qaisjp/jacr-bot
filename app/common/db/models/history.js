module.exports = (db, mongoose) => {
    const historySchema = new mongoose.Schema({
        _song: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "songs",
            required: true
        },
        _person: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "person",
            required: true
        },
        time: {
            type: Date,
            default: Date.now
        }
    });
    db.model("history", historySchema);
};