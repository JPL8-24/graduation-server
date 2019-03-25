var express = require("express");
var router = express.Router();
let paper = require("../models/paper");
let user = require("../models/user");

function computedRate(arr){
  let rate=0
  arr.forEach((item)=>{
    if(item.type==='1'&&item.isRight){
      rate+=2
    } else if(item.type==='2'&&item.isRight) {
      rate+=3
    } else if (item.type==='3' && item.checkRate) {
      rate+=item.checkRate
    }
  })
  return rate
}

/* GET home page. */
router.get("/", function(req, res, next) {
  res.json({
    status: "succe"
  });
});

router.get("/papaerList", (req, res, next) => {
  paper.find({}, (err, doc) => {
    if (err) {
      res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      res.json({
        status: "1",
        msg: "suc",
        data: doc
      });
    }
  });
});

router.get("/paperContent", (req, res, next) => {
  let paperID = req.query.paperID;
  paper.findOne(
    {
      paperID
    },
    (err, doc) => {
      if (err) {
        res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        res.json({
          status: "1",
          msg: "suc",
          data: doc
        });
      }
    }
  );
});

router.post("/resultToStu", (req, res, next) => {
  let questionInfo = req.body.questionInfo;
  let userID = req.body.userID;
  user.findOne(
    {
      userID
    },
    (err, userdoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        if (
          userdoc.testList.find(item => {
            return item.paperID === questionInfo.paperID;
          })
        ) {
          return res.json({
            status: "3",
            msg: "已做过本试题",
            data: ""
          });
        } else {
          userdoc.testList.push(questionInfo);
          userdoc.save((err, doc) => {
            if (err) {
              return res.json({
                status: "2",
                msg: err.message,
                data: ""
              });
            } else {
              res.json({
                status: "1",
                msg: "suc",
                data: ""
              });
            }
          });
        }
      }
    }
  );
});

router.post("/resultToTea", (req, res, next) => {
  let { teaID } = req.body;
  let { questionInfo } = req.body;
  user.findOne(
    {
      userID: teaID
    },
    (err, userdoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        let hasPaper = userdoc.checkList.some(item => {
          return (item.paperID = questionInfo.paperID);
        });
        if (userdoc.checkList.length === 0) {
          const tem_paper = {};
          tem_paper.paperID = questionInfo.paperID;
          tem_paper.title = questionInfo.title;
          tem_paper.checked = [];
          tem_paper.noCheck = [];
          tem_paper.noCheck.push({
            userID: questionInfo.userID,
            doneTime: questionInfo.doneTime
          });
          userdoc.checkList.push(tem_paper);
          userdoc.save((err, doc) => {
            return res.json({
              status: "1",
              msg: "suc",
              data: ""
            });
          });
        } else if (hasPaper) {
          const target_paper = userdoc.checkList.find(item => {
            return item.paperID === questionInfo.paperID;
          });
          if (
            target_paper.noCheck.find(item => {
              return item.userID === questionInfo.userID;
            })
          ) {
            return res.json({
              status: "3",
              msg: "该学生已经做过题目，不能再次提交",
              data: ""
            });
          } else {
            target_paper.noCheck.push({
              userID: questionInfo.userID,
              doneTime: questionInfo.doneTime
            });
            userdoc.save((err, doc) => {
              res.json({
                status: "1",
                msg: "suc",
                data: ""
              });
            });
          }
        }
      }
    }
  );
});

router.post("/saveProgress", (req, res, next) => {});

router.get("/checkList", (req, res, next) => {
  let { teacherID } = req.query;
  user.findOne(
    {
      userID: teacherID
    },
    (err, userdoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        return res.json({
          status: "1",
          msg: "suc",
          data: userdoc.checkList
        });
      }
    }
  );
});

router.get("/studentResult", (req, res, next) => {
  let { userID } = req.query;
  let { paperID } = req.query;
  user.findOne(
    {
      userID
    },
    (err, doc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        const target = doc.testList.find(item => {
          return item.paperID == paperID;
        });
        res.json({
          status: "1",
          msg: "suc",
          data: target
        });
      }
    }
  );
});

router.post("/checkResult", async (req, res, next) => {
  let stuID = req.body.stuID;
  let teacherID = req.body.teacherID;
  let checkResult = req.body.checkResult;
  let paperID = req.body.paperID;
  let totalRate=computedRate(checkResult)
  await user.findOne(
    {
      userID: teacherID
    },
    (err, teaDoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        let targetindex;
        teaDoc.checkList.forEach(item => {
          if (item.paperID === paperID) {
            item.noCheck.forEach((element, index) => {
              if (element.userID === stuID) {
                targetindex = index;
                const targetItem = item.noCheck.splice(targetindex, 1);
                console.log(targetItem);
                item.checked.push(targetItem[0]);
                teaDoc.markModified("checkList");
                teaDoc.save((err, doc) => {});
              }
            });
          }
        });
      }
    }
  );
  await user.findOne(
    {
      userID: stuID
    },
    (err, stuDoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        let targetindex;
        stuDoc.testList.forEach((item, index) => {
          if (item.paperID === paperID) {
            targetindex = index;
          }
        });
        stuDoc.testList[targetindex].isChecked = true;
        stuDoc.testList[targetindex].questions = checkResult;
        stuDoc.testList[targetindex].totalRate = totalRate;
        stuDoc.markModified("testList");
        stuDoc.save((err, doc) => {});
      }
    }
  );
  await paper.findOne({paperID},(err,paperDoc)=>{
    if(err){
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      paperDoc.StudentList.push({
        studentID:stuID,
        totalRate:totalRate
      })
      paperDoc.markModified('StudentList')
      paperDoc.save((err,doc)=>{
        if(err){
          return res.json({
            status: "2",
            msg: err.message,
            data: ""
          });
        } else {
          res.json({
            status:'1',
            msg:'suc',
            data:""
          })
        }
      })
    }
  })
});


module.exports = router;
