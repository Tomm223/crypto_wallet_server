module.exports = class UserDto {
   email;
   id;
   username;
   lastname;
   currency;
   imgSrc;

   constructor(model) {
      this.email = model.email;
      this.id = model._id;
      this.username = model.username;
      this.lastname = model.lastname;
      this.currency = model.currency;
      this.imgSrc = model.imgSrc;
   }
}
