function loginView(req,res){
  res.render('login', { message: req.flash('error') });
}

function authenticate(req,res){
  res.redirect('/');
}

module.exports = {
  loginView: loginView,
  authenticate: authenticate
}
