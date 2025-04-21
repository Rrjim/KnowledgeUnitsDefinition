import express from "express";
import { likeRepo, searchUsers, usersRepo, getLikedRepos } from "../controllers/repoController.js";
import { addFileToRepo, getRepoFiles, getAllUserFiles } from "../controllers/fileController.js";
import { createCollection, deleteFileFromCollection, getCollectionFiles, getCollectionRepositories, getCollections, getUserCandidates, updateCollection } from "../controllers/collectionController.js";
import { isAuthenticated } from "../authMiddleware/authMiddleware.js";



const router = express.Router();

router.get("/github-search/:username",isAuthenticated, searchUsers); 
router.post("/like-repo", isAuthenticated, likeRepo);
router.get("/liked-repos", isAuthenticated, getLikedRepos);
router.get("/repo-js-code/:username/:repoName/content",isAuthenticated, usersRepo);
router.post("/add-file", isAuthenticated, addFileToRepo);
router.get("/added-files", isAuthenticated, getRepoFiles);
router.get('/user-files', isAuthenticated, getAllUserFiles); 
router.get("/collections", isAuthenticated, getCollections);
router.post("/collection-repos", isAuthenticated, getCollectionRepositories);
router.post('/create-collection', isAuthenticated, createCollection);
router.put('/update-collection', isAuthenticated, updateCollection);
router.get('/user-candidates', isAuthenticated, getUserCandidates);
router.get('/collection-files', isAuthenticated, getCollectionFiles);
router.post("/collection-files/delete", isAuthenticated, deleteFileFromCollection);


export default router;
