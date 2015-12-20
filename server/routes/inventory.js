function executeWorker(req,res){
  rabbit.default()
    .publish("execute:worker",{ key:"jobs" })
    .on('drain', rabbit.close);

    res.status(200).send();
}

module.exports = {
  executeWorker: executeWorker
}
