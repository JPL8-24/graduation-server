var express = require("express");
var router = express.Router();
let paper = require("../models/paper");
let user = require("../models/user");
let post = require("../models/post");
let fs = require('fs')
let path = require('path')


function computedRate(arr) {
  let rate = 0;
  arr.forEach(item => {
    if (item.type === "1" && item.isRight) {
      rate += 3;
    } else if (item.type === "2" && item.isRight) {
      rate += 5;
    } else if (item.type === "3" && item.checkRate) {
      rate += item.checkRate;
    }
  });
  return rate;
}

/* GET home page. */
router.get("/", function (req, res, next) {
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
  paper.findOne({
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
  user.findOne({
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
  let {
    teaID
  } = req.body;
  let {
    questionInfo
  } = req.body;
  console.log(teaID)
  user.findOne({
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
          return (item.paperID == questionInfo.paperID);
        });
        console.log(hasPaper)
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
          userdoc.markModified("checkList")
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
        } else {
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
          userdoc.markModified("checkList")
          userdoc.save((err, doc) => {
            return res.json({
              status: "1",
              msg: "suc",
              data: ""
            });
          });
        }
      }
    }
  );
});

router.post("/saveProgress", (req, res, next) => {});

router.get("/checkList", (req, res, next) => {
  let {
    teacherID
  } = req.query;
  user.findOne({
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
  let {
    userID
  } = req.query;
  let {
    paperID
  } = req.query;
  user.findOne({
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
  let totalRate = computedRate(checkResult);
  await user.findOne({
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
  await user.findOne({
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
  await paper.findOne({
      paperID
    },
    (err, paperDoc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        paperDoc.StudentList.push({
          studentID: stuID,
          totalRate: totalRate
        });
        paperDoc.markModified("StudentList");
        paperDoc.save((err, doc) => {
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
  );
});

router.post("/addForum", async (req, res, next) => {
  let {
    payload
  } = req.body;
  await new post(payload).save((err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    }
  });
  await user.findOne({
      userID: payload.user.userID
    },
    (err, doc) => {
      if (err) {
        return res.json({
          status: "2",
          msg: err.message,
          data: ""
        });
      } else {
        doc.postList.push({
          postID: payload.postID
        });
        doc.markModified("postList");
        doc.save((err, doc) => {
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
  );
});

router.get("/postList", (req, res, next) => {
  let {
    pageSize
  } = req.query;
  let {
    page
  } = req.query;
  let skip = (page - 1) * pageSize;
  let postModel = post
    .find({})
    .skip(skip)
    .limit(parseInt(pageSize));
  postModel.exec((err, doc) => {
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
        data: doc
      });
    }
  });
});

router.get("/postDetail", (req, res, next) => {
  let postID = req.query.postID;
  post.findOne({
    postID
  }, (err, doc) => {
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
        data: doc
      });
    }
  });
});

router.post("/addComment", (req, res, next) => {
  const payload = req.body.payload;
  let postID = req.body.postID;
  post.findOne({
    postID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      doc.comments.push(payload);
      doc.markModified("comments");
      doc.save((err, doc) => {
        res.json({
          status: "1",
          msg: "suc",
          data: doc
        });
      });
    }
  });
});

router.post("/addReply", (req, res, next) => {
  const payload = req.body.payload;
  let commentID = req.body.commentID;
  let postID = req.body.postID;
  post.findOne({
    postID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      let targetIndex;
      doc.comments.forEach((item, index) => {
        if (item.commentID === commentID) {
          targetIndex = index;
        }
      });
      doc.comments[targetIndex].reply.push(payload);
      doc.markModified("comments");
      doc.save((err, doc) => {
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
  });
});

router.post('/removeComment', (req, res, next) => {
  let {
    postID,
    commentID
  } = req.body
  post.findOne({
    postID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      let targetIndex
      doc.comments.forEach((item, index) => {
        if (item.commentID === commentID) {
          targetIndex = index
        }
      })
      doc.comments.splice(targetIndex, 1)
      doc.markModified("comments")
      doc.save((err, doc) => {
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
          })
        }
      })
    }
  })
})

router.post('/removeReply', (req, res, next) => {
  let {
    postID,
    commentID,
    replyID
  } = req.body
  post.findOne({
    postID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      let targetCommentIndex
      let targetReplyIndex
      doc.comments.forEach((item, index) => {
        if (item.commentID === commentID) {
          targetCommentIndex = index
        }
      })
      doc.comments[targetCommentIndex].reply.forEach((element, index) => {
        if (element.replyID === replyID) {
          targetReplyIndex = index
        }
      })
      doc.comments[targetCommentIndex].reply.splice(targetReplyIndex, 1)
      doc.markModified("comments")
      doc.save((err, doc) => {
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
          })
        }
      })
    }
  })
})

router.get('/UserPostList', (req, res, next) => {
  let {
    userID
  } = req.query
  user.findOne({
    userID
  }, (err, doc) => {
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
        data: doc.postList
      })
    }
  })
})

router.post('/removePost', async (req, res, next) => {
  let {
    userID,
    postID
  } = req.body
  await user.findOne({
    userID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      let targetIndex
      doc.postList.forEach((item, index) => {
        if (item.postID === postID) {
          targetIndex = index
        }
      })
      doc.postList.splice(targetIndex, 1)
      doc.save()
    }
  })

  await post.remove({
    postID
  }, (err, doc) => {
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
      })
    }
  })
})

router.post('/vertifyPassword', (req, res, next) => {
  let {
    userID,
    passWord
  } = req.body
  console.log(passWord)
  user.findOne({
    userID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      if (doc.userPwd == passWord) {
        res.json({
          status: '1',
          msg: 'suc',
          data: ""
        })
      } else {
        res.json({
          status: '1',
          msg: '密码错误',
          data: ""
        })
      }
    }
  })
})

router.post('/modifyPassword', (req, res, next) => {
  let {
    userID,
    passWord
  } = req.body
  user.findOne({
    userID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      if (doc.userPwd == passWord) {
        res.json({
          status: "1",
          msg: "密码不能与旧密码相同",
          data: ""
        })
      } else {
        doc.userPwd = passWord
        doc.save((err, doc) => {
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
            })
          }
        })
      }
    }
  })
})

var multer = require('multer');
var upload = multer({
  dest: './public/images'
});

router.post('/uploadPortrait', upload.single('file'), (req, res, netx) => {
  var file_type;
  if (req.file.mimetype.split('/')[0] == 'image') file_type = '.' + req.file.mimetype.split('/')[1];
  if (file_type) {
    fs.rename(req.file.path, req.file.path + file_type, function (err, doc) {
      if (err) {
        console.error(err);
        return;
      }
      res.json({
        status: "1",
        msg: "suc",
        data: 'http://localhost:3000/public/images/' + req.file.filename + file_type
      })
    })
  }
})

router.post('/modifyPortrait', (req, res) => {
  let {
    userID,
    portrait
  } = req.body
  user.findOne({
    userID
  }, (err, doc) => {
    if (err) {
      return res.json({
        status: "2",
        msg: err.message,
        data: ""
      });
    } else {
      doc.portrait = portrait
      doc.save((err, doc) => {
        res.json({
          status: "1",
          msg: "suc",
          data: doc
        })
      })
    }
  })
})

router.post('/addPaper', (req, res) => [
  new paper(req.body).save((err, doc) => {
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
      })
    }
  })
])
module.exports = router;