import mongoose from "mongoose"
const { Schema, model } = mongoose;

const demoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,

  },
  phone: {
    type: String,
    required: true,

  }
 
}, {
  timestamps: true,  
})

const Demo = mongoose.models.Demo || mongoose.model("Demo", demoSchema)

export default Demo




