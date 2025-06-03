const validExists = async (model, param, column)=>{
    return await model.findOne({
        where:{[param]:column}
    })
}

module.exports=validExists;