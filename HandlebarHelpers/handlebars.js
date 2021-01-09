// formatDate: (createdAt, formatDate)=> {
//     console.log(createdAt);
//     return moment(createdAt).format(formatDate); 
//      }
function hbsHelpers(hbs) {
    console.log('hello');
    return hbs.create({
      helpers: { // This was missing
        inc: function(value, options) {
          console.log('reading it');
          return parseInt(value) + 1;
        }
  
        // More helpers...
      }
  
    });
  }
  
  module.exports = hbsHelpers;