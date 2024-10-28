import { client } from "../config/db.js";
import { insert, update } from "../config/dynamicQuery.js";
import moment from "moment";
const promise = client.promise();
const BaseUrl = process.env.BASE_URL;

export default {

  addCategory : async (req, res) => {
        const { name, description, parentid = null, subcategories = [] } = req.body;

        if (!name) {
          return res.status(400).send({ message: "Category name is required", success: false });
        }
      
        try {

          await promise.query("START TRANSACTION");
      
          const insertCategoryQuery = `
            INSERT INTO category (name, description, parentid)
            VALUES (?, ?, ?)
          `;
          const [categoryRes] = await promise.query(insertCategoryQuery, [
            name,
            description,
            parentid,
          ]);
      
          const categoryId = categoryRes.insertId; 
          const addSubcategories = async (subcategories, parentId) => {
            for (const subcategory of subcategories) {
              const {
                name: subName,
                description: subDescription,
                subcategories: nestedSubcategories = [],
              } = subcategory;
      
              const [subCategoryRes] = await promise.query(insertCategoryQuery, [
                subName,
                subDescription,
                parentId,
              ]);
      
              const subCategoryId = subCategoryRes.insertId;
      
              if (nestedSubcategories.length > 0) {
                await addSubcategories(nestedSubcategories, subCategoryId);
              }
            }
          };
      
          if (subcategories.length > 0) {
            await addSubcategories(subcategories, categoryId);
          }
      
          await promise.query("COMMIT");
          return res.status(201).send({
            message: "Added successfully",
            success: true,
            categoryId: categoryId,
          });
        } catch (error) {
          await promise.query("ROLLBACK");
          console.error(`Error in addCategory: ${error}`);
          return res.status(500).send({ message: error.message, success: false });
        }
  },

  getOneCategory: async (req, res) => {
    try {
      const query = `SELECT * FROM category WHERE id = ?`;
      const [category] = await promise.query(query, [req.params.id]);
      if (!category[0]) {
        return res
          .status(404)
          .send({ message: "no record found", success: false, data: [] });
      } else {
        return res.status(200).send({
          message: "record fetched",
          success: true,
          data: category[0],
        });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  getAllCategories: async (req, res) => {
    try {
        const fetchCategoriesWithSubcategories = async (parentId = null) => {
            const getCategoriesQuery = `
            SELECT id, name, description, parentid
            FROM category
            WHERE parentid ${parentId ? "= ?" : "IS NULL"}
            ORDER BY createdAt DESC
          `;
          const [categories] = await promise.query(getCategoriesQuery, parentId ? [parentId] : []);
          for (const category of categories) {
            category.subcategories = await fetchCategoriesWithSubcategories(category.id);
          }
    
          return categories;
        };
        const categories = await fetchCategoriesWithSubcategories();
        return res.status(200).send({
          success: true,
          message: "Categories fetched successfully",
          categories: categories,
        });
      } catch (error) {
        console.error(`Error in getAllCategories: ${error}`);
        return res.status(500).send({ message: error.message, success: false });
      }
  },

  updateCategory: async (req, res) => {
    try {
        const result = await update(req.body, req.params.id);
        const updateQuery = `UPDATE category SET ${result.setClause} WHERE id = ?`;
        const [updateRes] = await promise.query(
          updateQuery,
          result.queryParams,
        );
        if (updateRes.affectedRows > 0) {
          return res
            .status(201)
            .send({ message: "Record updated", success: true });
        } else {
          return res
            .status(404)
            .send({ message: "record not found", success: false });
        }
  
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  deleteCategory: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: "Category ID is required", success: false });
    }
  
    try {
      const deleteCategoryAndSubcategories = async (categoryId) => {
        const getSubcategoriesQuery = `SELECT id FROM category WHERE parentid = ?`;
        const [subcategories] = await promise.query(getSubcategoriesQuery, [categoryId]);
        for (const subcategory of subcategories) {
          await deleteCategoryAndSubcategories(subcategory.id);
        }
        const deleteQuery = `DELETE FROM category WHERE id = ?`;
        await promise.query(deleteQuery, [categoryId]);
      };
  
      await deleteCategoryAndSubcategories(id);
  
      return res.status(200).send({ message: "deleted successfully", success: true });
    } catch (error) {
      console.error(`Error in deleteCategory: ${error}`);
      return res.status(500).send({ message: error.message, success: false });
    }
  },
  // deleteCategory: async (req, res) => {
  //   try {
  //       const { id } = req.params;
  //       const deleteQuery = "DELETE FROM category WHERE id = ?";
  //       const [deleteRes] = await promise.query(deleteQuery, [id]);
    
  //       if (deleteRes.affectedRows > 0) {
  //         return res
  //           .status(200)
  //           .send({ message: "Record deleted successfully", success: true });
  //       } else {
  //         return res
  //           .status(404)
  //           .send({ message: "Record not found", success: false });
  //       }
  //     } catch (error) {
  //       console.error(`Error ${error}`);
  //       return res.status(500).send({ message: error.message, success: false });
  //     }
  // },
};
