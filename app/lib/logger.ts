import log4js from "log4js"

log4js.configure({
    appenders:{
        console:{type : "stdout"},
        file:{
            type : "file",
            filename : "logs/app.log",
            maxLogSize:10*1024*1024,
            backups : 3
        }
    },
    categories :{
        default :{appenders : ["console","file"],level:'debug'}
    }
})
export const logger = (name:string)=>log4js.getLogger(name)