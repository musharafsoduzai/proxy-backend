import multer from "multer";

let imageCounter = 0;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    const company_name = req.body.company_name.replace(/\s/g, "");

    const originalName = file.originalname.split(".")[0];
    const extension = file.originalname.split(".").pop();

    const nameImage = originalName.replace(/\s/g, "");

    const imageName = `${company_name}_${nameImage}_${imageCounter}`;
    imageCounter++;

    cb(null, `${imageName}.${extension}`);
  },
});

const upload = multer({ storage });

export default upload;
