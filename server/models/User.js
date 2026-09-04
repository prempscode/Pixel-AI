import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    name: { type: String, trim: true },
    avatar: { type: String }
  },
  {
    timestamps: true
  }
)
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    delete ret.googleId
    return ret
  }
})

const user = mongoose.model('User', userSchema)
export default user
